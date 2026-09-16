import time
import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field

logger = logging.getLogger("KrishiIoT")

router = APIRouter(prefix="/api/iot", tags=["IoT Smart Farm"])

# In-memory IoT state store (initialized with default baseline)
DEFAULT_DEVICE_ID = "krishiai-node-01"

device_store: Dict[str, Any] = {
    DEFAULT_DEVICE_ID: {
        "id": DEFAULT_DEVICE_ID,
        "name": "Field Node 01 (ESP32)",
        "zone": "Zone A — Wheat Plot",
        "crop": "Wheat (HD-2967)",
        "status": "offline",
        "mode": "AUTO", # AUTO | MANUAL
        "lastSeen": 0,
        "settings": {
            "criticalMoisture": 25,
            "targetMoisture": 65,
            "autoMaxDurationMinutes": 15,
            "manualMaxDurationMinutes": 30,
            "rainInterlock": True,
            "soilDryAdc": 3200,
            "soilWetAdc": 1400
        }
    }
}

telemetry_store: Dict[str, Any] = {
    DEFAULT_DEVICE_ID: {
        "deviceId": DEFAULT_DEVICE_ID,
        "soilMoisture": 0,
        "soilRaw": 0,
        "temperature": 0.0,
        "humidity": 0.0,
        "rain": False,
        "light": False,
        "pump": False,
        "pumpStartedAt": None,
        "pumpDurationMinutes": 0,
        "pumpStartedBy": None,
        "timestamp": 0
    }
}

irrigation_history: List[Dict[str, Any]] = [
    {
        "id": "irr-01",
        "timestamp": int(time.time()) - 86400,
        "startTime": "Yesterday, 06:30 AM",
        "durationMinutes": 15,
        "mode": "AUTO",
        "triggeredBy": "KrishiAI Decision Engine",
        "startMoisture": 22,
        "endMoisture": 64,
        "status": "COMPLETED"
    },
    {
        "id": "irr-02",
        "timestamp": int(time.time()) - 43200,
        "startTime": "Yesterday, 06:30 PM",
        "durationMinutes": 10,
        "mode": "MANUAL",
        "triggeredBy": "Farmer App",
        "startMoisture": 31,
        "endMoisture": 60,
        "status": "COMPLETED"
    }
]

alerts_store: List[Dict[str, Any]] = []

def evaluate_decision(telemetry: Dict[str, Any], device: Dict[str, Any]) -> Dict[str, Any]:
    moisture = telemetry.get("soilMoisture", 0)
    rain = telemetry.get("rain", False)
    light = telemetry.get("light", True)
    temp = telemetry.get("temperature", 28.0)
    humidity = telemetry.get("humidity", 60.0)
    pump = telemetry.get("pump", False)
    settings = device.get("settings", {})
    critical = settings.get("criticalMoisture", 25)
    target = settings.get("targetMoisture", 65)

    sense_status = f"Moisture at {moisture}%, Rain: {'DETECTED' if rain else 'None'}, Light: {'Day' if light else 'Night'}"

    if device.get("status") == "offline" or (telemetry.get("timestamp", 0) == 0 and moisture == 0):
        return {
            "action": "STANDBY",
            "shouldAutoIrrigate": False,
            "reason": "IoT Field Node is offline. Waiting for ESP32 hardware connection.",
            "pipeline": {
                "sense": "Node Offline — Awaiting telemetry packet from ESP32",
                "understand": "Hardware is disconnected. Automated irrigation held in safe state.",
                "decide": "System in safe standby mode.",
                "act": "Relay GPIO 26 DE-ENERGIZED (Safe Standby)",
                "learn": "Evapotranspiration model paused until hardware transmits."
            },
            "dryingRatePerHour": 0.0,
            "hoursUntilCritical": 0.0,
            "evaluatedAt": int(time.time())
        }

    deficit = max(0, target - moisture)
    if rain:
        understand = "Natural precipitation active. Soil tension easing without irrigation."
    elif moisture < critical:
        understand = f"Critical soil moisture deficit ({deficit}%). Root zone at severe stress."
    elif moisture < 40:
        understand = f"Moderate water deficit ({deficit}%). Approaching wilting threshold."
    else:
        understand = "Adequate root-zone capillary water. Hydration is optimal."

    if rain:
        action = "HOLD_RAIN"
        reason = "FC-37 detected rainfall. Pump locked out to prevent waterlogging & root rot."
        should_irrigate = False
    elif moisture < critical:
        action = "IRRIGATE_NOW"
        reason = f"Soil moisture ({moisture}%) dropped below critical safety threshold ({critical}%)."
        should_irrigate = True
    elif moisture < 40 and not pump:
        action = "RECOMMEND_IRRIGATION"
        reason = f"Soil moisture at {moisture}%. Timed morning/evening cycle recommended."
        should_irrigate = False
    elif pump and moisture >= target:
        action = "STOP_OPTIMAL"
        reason = f"Target moisture ({target}%) achieved. De-energizing pump."
        should_irrigate = False
    else:
        action = "STANDBY"
        reason = f"Moisture stable at {moisture}%. Monitoring drying rate."
        should_irrigate = False

    act_msg = "Pump ACTIVE (GPIO 26 LOW)" if pump else "Pump STANDBY (GPIO 26 HIGH)"

    drying_rate = round(1.8 + (temp - 25) * 0.1 - (humidity - 50) * 0.02, 1)
    drying_rate = max(0.5, min(5.0, drying_rate))
    hours_until_dry = max(0, round((moisture - critical) / drying_rate, 1)) if moisture > critical else 0

    return {
        "action": action,
        "shouldAutoIrrigate": should_irrigate,
        "reason": reason,
        "pipeline": {
            "sense": sense_status,
            "understand": understand,
            "decide": reason,
            "act": act_msg,
            "learn": f"Estimated drying rate: ~{drying_rate}%/hr. Approx {hours_until_dry}h until wilting threshold."
        },
        "dryingRatePerHour": drying_rate,
        "hoursUntilCritical": hours_until_dry,
        "evaluatedAt": int(time.time())
    }


class TelemetryPayload(BaseModel):
    deviceId: Optional[str] = DEFAULT_DEVICE_ID
    soilMoisture: int = Field(..., ge=0, le=100)
    soilRaw: Optional[int] = 2450
    temperature: float = 28.5
    humidity: float = 60.0
    rain: bool = False
    light: bool = True
    pump: Optional[bool] = False

class PumpControlPayload(BaseModel):
    deviceId: Optional[str] = DEFAULT_DEVICE_ID
    state: bool
    durationMinutes: Optional[int] = 10
    reason: Optional[str] = "Manual operator control"
    emergency: Optional[bool] = False


@router.get("/latest")
async def get_latest_telemetry(deviceId: str = DEFAULT_DEVICE_ID):
    device = device_store.get(deviceId, device_store[DEFAULT_DEVICE_ID])
    telemetry = telemetry_store.get(deviceId, telemetry_store[DEFAULT_DEVICE_ID])

    last_seen = device.get("lastSeen", 0)
    if last_seen == 0 or (time.time() - last_seen > 45):
        device["status"] = "offline"

    decision = evaluate_decision(telemetry, device)
    
    return {
        "success": True,
        "deviceId": deviceId,
        "device": device,
        "telemetry": telemetry,
        "decision": decision,
        "alerts": alerts_store,
        "timestamp": int(time.time())
    }


@router.post("/telemetry")
@router.post("/devices/{device_id}/telemetry")
async def ingest_telemetry(payload: TelemetryPayload, device_id: Optional[str] = None):
    deviceId = device_id or payload.deviceId or DEFAULT_DEVICE_ID
    if deviceId not in device_store:
        device_store[deviceId] = {
            "id": deviceId,
            "name": f"Field Node {deviceId}",
            "zone": "Zone A",
            "status": "online",
            "mode": "AUTO",
            "settings": device_store[DEFAULT_DEVICE_ID]["settings"]
        }

    device = device_store[deviceId]
    device["status"] = "online"
    device["lastSeen"] = int(time.time())

    current_pump = telemetry_store.get(deviceId, {}).get("pump", False)
    new_pump = payload.pump if payload.pump is not None else current_pump

    if payload.rain and new_pump:
        new_pump = False
        alerts_store.append({
            "id": f"alert-{int(time.time())}",
            "type": "RAIN_SAFETY_CUTOFF",
            "message": "Rain detected during irrigation. Pump shut down automatically.",
            "severity": "high",
            "timestamp": int(time.time()),
            "acknowledged": False
        })

    telemetry_store[deviceId] = {
        "deviceId": deviceId,
        "soilMoisture": payload.soilMoisture,
        "soilRaw": payload.soilRaw,
        "temperature": payload.temperature,
        "humidity": payload.humidity,
        "rain": payload.rain,
        "light": payload.light,
        "pump": new_pump,
        "pumpStartedAt": telemetry_store.get(deviceId, {}).get("pumpStartedAt"),
        "pumpDurationMinutes": telemetry_store.get(deviceId, {}).get("pumpDurationMinutes", 0),
        "pumpStartedBy": telemetry_store.get(deviceId, {}).get("pumpStartedBy"),
        "timestamp": int(time.time())
    }

    decision = evaluate_decision(telemetry_store[deviceId], device)

    if device.get("mode") == "AUTO" and decision["shouldAutoIrrigate"] and not new_pump and not payload.rain:
        telemetry_store[deviceId]["pump"] = True
        telemetry_store[deviceId]["pumpStartedAt"] = int(time.time())
        telemetry_store[deviceId]["pumpDurationMinutes"] = device["settings"].get("autoMaxDurationMinutes", 15)
        telemetry_store[deviceId]["pumpStartedBy"] = "KrishiAI Decision Engine (Auto)"

    return {
        "success": True,
        "message": "Telemetry updated",
        "pumpCommand": telemetry_store[deviceId]["pump"],
        "decision": decision
    }


@router.post("/pump")
async def control_pump(payload: PumpControlPayload):
    deviceId = payload.deviceId or DEFAULT_DEVICE_ID
    device = device_store.get(deviceId, device_store[DEFAULT_DEVICE_ID])
    telemetry = telemetry_store.get(deviceId, telemetry_store[DEFAULT_DEVICE_ID])

    if payload.state and telemetry.get("rain", False):
        raise HTTPException(status_code=400, detail="Cannot turn ON pump while rain sensor detects active rainfall (Safety Interlock).")

    telemetry["pump"] = payload.state
    if payload.state:
        telemetry["pumpStartedAt"] = int(time.time())
        telemetry["pumpDurationMinutes"] = payload.durationMinutes or 10
        telemetry["pumpStartedBy"] = payload.reason or "Manual App"
        
        irrigation_history.insert(0, {
            "id": f"irr-{int(time.time())}",
            "timestamp": int(time.time()),
            "startTime": "Just now",
            "durationMinutes": payload.durationMinutes or 10,
            "mode": device.get("mode", "MANUAL"),
            "triggeredBy": payload.reason or "Manual App",
            "startMoisture": telemetry.get("soilMoisture", 0),
            "endMoisture": None,
            "status": "ACTIVE"
        })
    else:
        telemetry["pumpStartedAt"] = None
        if irrigation_history and irrigation_history[0]["status"] == "ACTIVE":
            irrigation_history[0]["status"] = "COMPLETED"
            irrigation_history[0]["endMoisture"] = telemetry.get("soilMoisture", 0)

    decision = evaluate_decision(telemetry, device)
    return {
        "success": True,
        "message": f"Pump {'STARTED' if payload.state else 'STOPPED'}",
        "telemetry": telemetry,
        "decision": decision
    }


@router.post("/mode")
async def switch_mode(deviceId: str = DEFAULT_DEVICE_ID, mode: str = Body(..., embed=True)):
    if mode not in ["AUTO", "MANUAL"]:
        raise HTTPException(status_code=400, detail="Mode must be AUTO or MANUAL")
    if deviceId not in device_store:
        raise HTTPException(status_code=404, detail="Device not found")
    device_store[deviceId]["mode"] = mode
    return {"success": True, "mode": mode}


@router.get("/history")
async def get_history(deviceId: str = DEFAULT_DEVICE_ID, range: str = "24h"):
    now = int(time.time())
    points = []
    base_moisture = telemetry_store.get(deviceId, {}).get("soilMoisture", 45)
    base_temp = telemetry_store.get(deviceId, {}).get("temperature", 28.0)
    base_humidity = telemetry_store.get(deviceId, {}).get("humidity", 60.0)

    steps = 12
    step_sec = 7200 if range == "24h" else 300
    for i in range(steps, -1, -1):
        t = now - (i * step_sec)
        time_label = time.strftime("%H:%M", time.localtime(t))
        points.append({
            "timestamp": t,
            "time": time_label,
            "soilMoisture": max(15, min(85, base_moisture + ((i % 3) * 2) - 3)),
            "temperature": round(base_temp + ((i % 4) * 0.8) - 1.5, 1),
            "humidity": round(base_humidity - ((i % 3) * 1.5) + 2, 0)
        })

    return {
        "success": True,
        "range": range,
        "data": points,
        "irrigationHistory": irrigation_history[:10]
    }


@router.get("/alerts")
async def get_alerts(deviceId: str = DEFAULT_DEVICE_ID):
    return {"success": True, "alerts": alerts_store}


# Dedicated alias router for /api/devices/{device_id}/telemetry
devices_router = APIRouter(prefix="/api/devices", tags=["IoT Devices"])

@devices_router.post("/{device_id}/telemetry")
async def ingest_device_telemetry(device_id: str, payload: TelemetryPayload):
    return await ingest_telemetry(payload, device_id=device_id)

@devices_router.get("/{device_id}/telemetry")
async def get_device_telemetry(device_id: str):
    return await get_latest_telemetry(deviceId=device_id)

