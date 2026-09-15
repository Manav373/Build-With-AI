import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { storage } from './storage.js';
import { DecisionEngine } from './decisionEngine.js';

let activePort = null;
let activeParser = null;
let currentBlock = {};

export async function listSerialPorts() {
  try {
    const ports = await SerialPort.list();
    const mapped = ports.map(p => {
      const friendly = p.friendlyName || p.path;
      const mfg = p.manufacturer || '';
      const isBluetooth = friendly.toLowerCase().includes('bluetooth') || mfg.toLowerCase().includes('microsoft');
      const isEsp32 = friendly.toLowerCase().includes('cp210') || 
                      friendly.toLowerCase().includes('ch340') || 
                      friendly.toLowerCase().includes('ftdi') || 
                      friendly.toLowerCase().includes('uart') || 
                      friendly.toLowerCase().includes('usb serial') || 
                      mfg.toLowerCase().includes('silicon') || 
                      mfg.toLowerCase().includes('wch');

      let displayName = p.path;
      if (isEsp32) {
        displayName = `⭐ ${p.path} (USB Hardware - ${mfg || 'ESP32/UART'})`;
      } else if (isBluetooth) {
        displayName = `📶 ${p.path} (Bluetooth Link)`;
      } else {
        displayName = `🔌 ${p.path} (${friendly})`;
      }

      return {
        path: p.path,
        manufacturer: p.manufacturer || 'Standard',
        friendlyName: friendly,
        displayName,
        isEsp32,
        isBluetooth,
        vendorId: p.vendorId,
        productId: p.productId
      };
    });

    // Sort USB / ESP32 devices first, then others, Bluetooth last
    mapped.sort((a, b) => {
      if (a.isEsp32 && !b.isEsp32) return -1;
      if (!a.isEsp32 && b.isEsp32) return 1;
      if (!a.isBluetooth && b.isBluetooth) return -1;
      if (a.isBluetooth && !b.isBluetooth) return 1;
      return a.path.localeCompare(b.path, undefined, { numeric: true });
    });

    return mapped;
  } catch (err) {
    console.error('Error listing serial ports:', err);
    return [];
  }
}

export function connectSerialPort(path, baudRate = 115200, broadcastCallback = () => {}) {
  if (activePort && activePort.isOpen) {
    activePort.close();
  }

  return new Promise((resolve, reject) => {
    try {
      activePort = new SerialPort({
        path,
        baudRate: Number(baudRate),
        autoOpen: true
      });

      activeParser = activePort.pipe(new ReadlineParser({ delimiter: '\n' }));

      activePort.on('open', () => {
        console.log(`🔌 [SERIAL] Connected to ESP32 on ${path} at ${baudRate} baud`);
        resolve({ success: true, message: `Connected to ${path}` });
      });

      activeParser.on('data', (line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // 1. Check if JSON formatted
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const data = JSON.parse(trimmed);
            const telemetry = storage.addTelemetry('krishiai-node-01', data);
            const dev = storage.getDevice('krishiai-node-01');
            const decision = DecisionEngine.evaluate(telemetry, dev);
            storage.decisionState['krishiai-node-01'] = decision;

            broadcastCallback({
              type: 'TELEMETRY_UPDATE',
              deviceId: 'krishiai-node-01',
              telemetry,
              decision,
              device: dev,
              source: 'SERIAL_USB'
            });
            return;
          } catch (e) {}
        }

        // 2. Parse User's exact code.txt human-readable printSerialData()
        if (trimmed.includes('Soil Raw')) {
          const val = parseInt(trimmed.split(':')[1]);
          if (!isNaN(val)) currentBlock.soilRaw = val;
        } else if (trimmed.includes('Soil Moisture')) {
          const val = parseInt(trimmed.split(':')[1].replace('%', ''));
          if (!isNaN(val)) currentBlock.soilMoisture = val;
        } else if (trimmed.includes('Temperature')) {
          const val = parseFloat(trimmed.split(':')[1].replace('C', ''));
          if (!isNaN(val)) currentBlock.temperature = val;
        } else if (trimmed.includes('Humidity')) {
          const val = parseFloat(trimmed.split(':')[1].replace('%', ''));
          if (!isNaN(val)) currentBlock.humidity = val;
        } else if (trimmed.includes('Rain') && !trimmed.includes('Rain Status')) {
          currentBlock.rain = !trimmed.includes('NO RAIN');
        } else if (trimmed.includes('Light') && !trimmed.includes('Light Raw')) {
          currentBlock.light = trimmed.includes('LIGHT') && !trimmed.includes('DARK');
        } else if (trimmed.includes('Relay')) {
          currentBlock.pump = trimmed.includes('ON');
        } else if (trimmed.includes('----------------------------------------') || trimmed.includes('========================================')) {
          if (currentBlock.soilMoisture !== undefined || currentBlock.temperature !== undefined) {
            const telemetry = storage.addTelemetry('krishiai-node-01', currentBlock);
            const dev = storage.getDevice('krishiai-node-01');
            const decision = DecisionEngine.evaluate(telemetry, dev);
            storage.decisionState['krishiai-node-01'] = decision;

            broadcastCallback({
              type: 'TELEMETRY_UPDATE',
              deviceId: 'krishiai-node-01',
              telemetry,
              decision,
              device: dev,
              source: 'SERIAL_USB'
            });

            console.log(`📡 [SERIAL RX] Soil: ${telemetry.soilMoisture}%, Temp: ${telemetry.temperature}°C, Rain: ${telemetry.rain ? 'YES' : 'NO'}, Light: ${telemetry.light ? 'DAY' : 'DARK'}`);
            currentBlock = {};
          }
        }
      });

      activePort.on('error', (err) => {
        console.error(`❌ [SERIAL ERROR] ${err.message}`);
      });

      activePort.on('close', () => {
        console.log(`🔌 [SERIAL] Disconnected from ${path}`);
      });

    } catch (err) {
      console.error('Serial connection failed:', err);
      reject(err);
    }
  });
}

export function disconnectSerialPort() {
  if (activePort && activePort.isOpen) {
    activePort.close();
    activePort = null;
    activeParser = null;
    return true;
  }
  return false;
}

export function getSerialStatus() {
  return {
    connected: activePort ? activePort.isOpen : false,
    path: activePort ? activePort.path : null,
    baudRate: activePort ? activePort.baudRate : null
  };
}
