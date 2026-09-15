"""
app/core/agent.py  –  Shared base for KrishiAI agents
------------------------------------------------------
Both the WhatsApp agent and the Web agent call `process_query_base()`
with their own system prompt so each channel can be tuned independently.
"""

import json
import os
import time
import logging
from groq import AsyncGroq
from pydantic import BaseModel
import tiktoken

from app.services.weather import get_weather_by_city as get_weather
from app.services.crop_advice import get_crop_advice as crop_advice
from app.services.market import get_market_price
from app.services.disease import analyze_crop_image as detect_crop_disease
from app.utils.speech import transcribe_audio
from app.services.scheme import get_gov_scheme
from app.services.soil import analyze_soil_health
from app.services.pest import get_pest_alerts
from app.services.yield_estimation import estimate_yield
from app.services.irrigation import calculate_irrigation
from app.services.market import get_commodity_trends

logger = logging.getLogger("KrishiMCP.Agent")

# ---------------------------------------------------------------------------
# Simple in-memory cache: {cache_key: (result, expires_at)}
# ---------------------------------------------------------------------------
_CACHE: dict = {}
CACHE_TTL = 600  # 10 minutes

def _cache_get(key: str):
    entry = _CACHE.get(key)
    if entry and time.time() < entry[1]:
        return entry[0]
    return None

def _cache_set(key: str, value):
    _CACHE[key] = (value, time.time() + CACHE_TTL)

# ---------------------------------------------------------------------------
# Tool schemas (shared by both channels)
# ---------------------------------------------------------------------------
TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location. Pass a city name or a combined 'City, District, State' string. You can also pass GPS coordinates like '23.09,72.53'. Do NOT guess.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "Location name or coordinates"}
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "crop_advice",
            "description": "Get dynamic AI farming advice based on crop, location and weather.",
            "parameters": {
                "type": "object",
                "properties": {
                    "crop": {"type": "string", "description": "Any crop name (e.g. wheat, dragon fruit)"},
                    "location": {"type": "string", "description": "City, district or state"},
                    "weather_summary": {"type": "string", "description": "Optional weather context"}
                },
                "required": ["crop", "location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_market_price",
            "description": "Fetch real-time AI-estimated market prices and trends.",
            "parameters": {
                "type": "object",
                "properties": {
                    "crop": {"type": "string"},
                    "location": {"type": "string"}
                },
                "required": ["crop", "location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "detect_crop_disease",
            "description": "AI Vision analysis for crop diseases from images.",
            "parameters": {
                "type": "object",
                "properties": {
                    "image_url": {"type": "string"}
                },
                "required": ["image_url"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "transcribe_audio",
            "description": "Transcribe multi-lingual agricultural queries.",
            "parameters": {
                "type": "object",
                "properties": {
                    "audio_url": {"type": "string"}
                },
                "required": ["audio_url"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_gov_scheme",
            "description": "Find active government subsidies and schemes (Central/State).",
            "parameters": {
                "type": "object",
                "properties": {
                    "state": {"type": "string"},
                    "crop": {"type": "string"}
                },
                "required": ["state", "crop"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_soil_health",
            "description": "Advanced AI soil analysis and amendment recommendations.",
            "parameters": {
                "type": "object",
                "properties": {
                    "soil_type": {"type": "string", "description": "Any soil description or type"},
                    "crop": {"type": "string", "description": "Target crop"},
                    "symptoms": {"type": "string", "description": "Visible deficiency signs (optional)"}
                },
                "required": ["soil_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_pest_alerts",
            "description": "Predict current pest threats using AI models.",
            "parameters": {
                "type": "object",
                "properties": {
                    "crop": {"type": "string"},
                    "temp_c": {"type": "number", "description": "Current temperature (optional)"},
                    "humidity": {"type": "number", "description": "Current humidity (optional)"}
                },
                "required": ["crop"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "estimate_yield",
            "description": "AI yield estimation based on field parameters.",
            "parameters": {
                "type": "object",
                "properties": {
                    "crop": {"type": "string", "description": "Crop name"},
                    "area_acres": {"type": "number", "description": "Number of acres (numeric value ONLY, e.g. 2.5)"},
                    "variety": {"type": "string", "description": "Seed variety name (optional)"},
                    "conditions": {"type": "string", "description": "General field condition (optional)"}
                },
                "required": ["crop", "area_acres"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_irrigation",
            "description": "AI-calculated water requirements for crops.",
            "parameters": {
                "type": "object",
                "properties": {
                    "crop": {"type": "string", "description": "Crop name"},
                    "area_acres": {"type": "number", "description": "Number of acres (numeric value ONLY)"},
                    "growth_stage": {"type": "string", "description": "Current stage (e.g. flowering)"},
                    "method": {"type": "string", "description": "Irrigation method (e.g. drip)"},
                    "rainfall_mm": {"type": "number", "description": "Recent rainfall in mm (numeric value)"}
                },
                "required": ["crop", "area_acres"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_commodity_trends",
            "description": "Fetch high-fidelity 7-day market price trends for a specific commodity.",
            "parameters": {
                "type": "object",
                "properties": {
                    "commodity": {"type": "string"},
                    "state": {"type": "string", "description": "State name (optional)"}
                },
                "required": ["commodity"]
            }
        }
    }
]

TOOL_FUNCTIONS_MAP = {
    "get_weather": get_weather,
    "crop_advice": crop_advice,
    "get_market_price": get_market_price,
    "detect_crop_disease": detect_crop_disease,
    "transcribe_audio": transcribe_audio,
    "get_gov_scheme": get_gov_scheme,
    "analyze_soil_health": analyze_soil_health,
    "get_pest_alerts": get_pest_alerts,
    "estimate_yield": estimate_yield,
    "calculate_irrigation": calculate_irrigation,
    "get_commodity_trends": get_commodity_trends,
}

CACHEABLE = {"get_weather", "get_market_price", "get_gov_scheme"}

# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _parse_failed_generation(fg: str):
    """Extract function name and args from Groq's broken XML/JSON format."""
    import re
    # 1. Standard XML-ish: <function=name>{"args":...}</function> or <function=name args </function>
    # This pattern is very lenient with delimiters and missing closing brackets
    pattern = r'(?:<|\(|\{|\[|/|\\)function[=\s:>]*(\w+)[\s>]*({.+?})\s*(?:(?:<|\(|\{|\[|/|\\)/function(?:>|\)|\{|\]|/|\\)*|$)'
    m = re.search(pattern, fg, re.DOTALL)
    if m:
        try:
            return m.group(1), json.loads(m.group(2))
        except json.JSONDecodeError:
            pass

    # 2. Raw JSON or other formats
    try:
        # Try to find anything that looks like a JSON object if the above failed
        json_match = re.search(r'({.+})', fg, re.DOTALL)
        if json_match:
            args = json.loads(json_match.group(1))
            # If it has "name" and "parameters", it's a tool call object
            if "name" in args:
                return args["name"], args.get("parameters", args.get("arguments", {}))
            # If it's just args, we need the name from elsewhere (harder)
    except Exception:
        pass
        
    return None, None


def _coerce_args(func_name: str, args: dict) -> dict:
    """Cast string values to the correct Python type per TOOLS_SCHEMA."""
    schema_props = {}
    for tool in TOOLS_SCHEMA:
        if tool["function"]["name"] == func_name:
            schema_props = tool["function"].get("parameters", {}).get("properties", {})
            break
    coerced = {}
    import re
    for k, v in args.items():
        expected = schema_props.get(k, {}).get("type")
        
        # If expected is number/integer but we got a string (common with Llama-3 tool calls)
        if (expected in ("number", "integer") or any(sub in k for sub in ["acres", "mm", "temp", "humidity"])) and isinstance(v, str):
            try:
                # Strip units: "10 acres" -> "10", "28.5C" -> "28.5"
                clean_v = re.sub(r'[^0-9.-]', '', v)
                if expected == "integer":
                    coerced[k] = int(float(clean_v))
                else:
                    coerced[k] = float(clean_v)
            except (ValueError, TypeError):
                coerced[k] = v
        else:
            coerced[k] = v
    return coerced


# ---------------------------------------------------------------------------
# Reliability Helpers (tiktoken)
# ---------------------------------------------------------------------------

def _count_tokens(text: str, model: str = "gpt-3.5-turbo") -> int:
    """
    Count tokens in text. 
    Llama-3 usage is similar to GPT-3.5/4 encoding for estimation purposes.
    """
    try:
        encoding = tiktoken.get_encoding("cl100k_base")
        return len(encoding.encode(text))
    except Exception:
        # Fallback to rough estimation (4 chars per token)
        return len(text) // 4

def _truncate_history(messages: list, max_tokens: int = 4000) -> list:
    """
    Truncate history from the top (oldest) if the total token count exceeds the limit.
    Ensures the system never crashes due to context window overflow.
    """
    # Keep system prompt (index 0) and the latest message (index -1)
    if not messages or len(messages) <= 2:
        return messages

    system_prompt = messages[0]
    user_query = messages[-1]
    history = messages[1:-1]
    
    total_tokens = _count_tokens(system_prompt["content"]) + _count_tokens(user_query["content"])
    
    valid_history = []
    # Add history from the most recent to the oldest until we hit the limit
    for turn in reversed(history):
        turn_tokens = _count_tokens(turn["content"])
        if total_tokens + turn_tokens < max_tokens:
            valid_history.insert(0, turn)
            total_tokens += turn_tokens
        else:
            break
            
    logger.info(f"[Reliability] Truncated history: {len(history)} turns -> {len(valid_history)} turns (Total tokens: ~{total_tokens})")
    return [system_prompt] + valid_history + [user_query]


# ---------------------------------------------------------------------------
# Shared base query processor (called by channel-specific agents)
# ---------------------------------------------------------------------------

async def process_query_base(
    message: str,
    system_prompt: str,
    history: list = None,
    tools: list = None
) -> str:
    """
    Core LLM + tool-calling loop used by both the WhatsApp agent and
    the Web agent. Each channel passes its own `system_prompt`.
    """
    selected_tools = tools if tools is not None else TOOLS_SCHEMA
    groq_api_key = os.getenv("GROQ_API_KEY")

    if not groq_api_key:
        logger.warning("GROQ_API_KEY not set – using mocked fallbacks.")
        if "market" in message.lower() or "price" in message.lower():
            return "To get the market price, please provide the crop name and your location."
        elif "weather" in message.lower():
            return "Please provide your location to get the weather forecast."
        elif "scheme" in message.lower():
            return "Please mention your state to find relevant agricultural schemes."
        elif any(w in message.lower() for w in ["sow", "plant", "grow", "advice", "crop"]):
            return "Please provide the crop name and your location to get specific advice."
        return "Namaste! I am Krishi AI. You can ask me about weather, crop advice, market prices, or send an image of a diseased crop."

    client = AsyncGroq(api_key=groq_api_key, max_retries=0)

    # Build message list
    messages = [{"role": "system", "content": system_prompt}]
    if history:
        for turn in history:
            role = turn.get("role", "user")
            content = turn.get("content", "").strip()
            if content and role in ("user", "assistant"):
                messages.append({"role": role, "content": content})
    if not message or not message.strip():
        logger.error("Empty message passed to process_query_base")
        return "I received an empty message. Can you please say that again?"
    
    messages.append({"role": "user", "content": message.strip()})

    # --- Reliability Step: Truncate History if too large ---
    messages = _truncate_history(messages, max_tokens=4000)

    async def _groq_chat_completion_with_fallback(**kwargs):
        """Helper to call Groq model with smart fallback across models."""
        primary_model = kwargs.get("model", "openai/gpt-oss-20b")
        fallback_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "openai/gpt-oss-20b"]
        
        try:
            return await client.chat.completions.create(**kwargs)
        except Exception as e:
            err_msg = str(e)
            if any(k in err_msg.lower() for k in ["429", "rate_limit", "503", "model_not_found", "tool_choice"]):
                for alt_model in fallback_models:
                    if alt_model != primary_model:
                        try:
                            logger.warning(f"Groq error with {primary_model}: {e}. Retrying with {alt_model}.")
                            kwargs["model"] = alt_model
                            return await client.chat.completions.create(**kwargs)
                        except Exception as alt_err:
                            logger.warning(f"Fallback to {alt_model} failed: {alt_err}")
                            continue
            raise

    async def _narrate(tool_name, tool_result, user_message):
        """Safely narrate tool results back to the farmer without triggering tool calls."""
        res_str = json.dumps(tool_result, ensure_ascii=False, indent=2) if isinstance(tool_result, (dict, list)) else str(tool_result)
        narrate_prompt = (
            f"You are KrishiAI, a friendly agricultural AI advisor.\n"
            f"The farmer asked: '{user_message}'\n\n"
            f"Here is the verified data from the '{tool_name}' tool:\n"
            f"{res_str}\n\n"
            f"INSTRUCTIONS:\n"
            f"- Directly write a helpful, friendly response for the farmer in rich Markdown.\n"
            f"- DO NOT call any functions or tools.\n"
            f"- DO NOT output JSON or function tags.\n"
            f"- If structured data or weather is provided, format key metrics cleanly.\n"
            f"- Include actionable farming advice based on this data."
        )
        narrate_msgs = [
            {"role": "user", "content": narrate_prompt}
        ]
        try:
            r = await client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=narrate_msgs
            )
            if r.choices and r.choices[0].message and r.choices[0].message.content:
                return r.choices[0].message.content
        except Exception as n_err:
            logger.warning(f"Narration model failed: {n_err}")

        # Deterministic fallback if all Groq calls fail so user NEVER gets a 500 error
        if tool_name == "get_weather":
            if isinstance(tool_result, dict):
                temp = tool_result.get("temp_c", tool_result.get("temperature", "N/A"))
                cond = tool_result.get("condition", tool_result.get("description", "Clear"))
                hum = tool_result.get("humidity", "N/A")
                city_name = tool_result.get("city", user_message)
                return (
                    f"### 🌤 Weather Forecast for {city_name}\n\n"
                    f"| Metric | Value |\n|---|---|\n"
                    f"| **Condition** | {cond} |\n"
                    f"| **Temperature** | {temp}°C |\n"
                    f"| **Humidity** | {hum}% |\n\n"
                    f"💡 **Farming Tip**: Safe conditions for routine crop management and monitoring."
                )
            return f"### 🌤 Weather Report\n\n{str(tool_result)}"
        return f"### 📋 Agricultural Advisory\n\n{res_str}"

    # --- Groq call with fallback for tool_use_failed ---
    try:
        response = await _groq_chat_completion_with_fallback(
            model="openai/gpt-oss-20b",
            messages=messages,
            tools=selected_tools if selected_tools else None,
            tool_choice="auto" if selected_tools else None
        )
        response_msg = response.choices[0].message

    except Exception as e:
        logger.error(f"Groq Chat Completion Error: {e}")
        err_str = str(e)
        if "tool_use_failed" in err_str or "failed_generation" in err_str:
            logger.warning(f"tool_use_failed caught, attempting manual fallback. Error: {e}")
            try:
                import re
                failed_gen = ""
                if hasattr(e, "body") and isinstance(e.body, dict):
                    failed_gen = e.body.get("error", {}).get("failed_generation", "")
                if not failed_gen:
                    fg_match = re.search(r"'failed_generation':\s*['\"](.*?)['\"](?:\s*\}|,|\n)", err_str, re.DOTALL)
                    if fg_match:
                        failed_gen = fg_match.group(1)
                if not failed_gen:
                    fg_match = re.search(r'(\{.*"name":\s*"\w+".*\})', err_str, re.DOTALL)
                    if fg_match:
                        failed_gen = fg_match.group(1)

                func_name, args = _parse_failed_generation(failed_gen)
                if func_name and args is not None:
                    args = _coerce_args(func_name, args)
                    logger.info(f"Fallback: executing {func_name} with args {args}")
                    func = TOOL_FUNCTIONS_MAP.get(func_name)
                    if func:
                        tool_result = await func(**args)
                        return await _narrate(func_name, tool_result, message)
            except Exception as parse_err:
                logger.error(f"Fallback parse failed: {parse_err}", exc_info=True)
        raise

    # --- Handle tool_calls ---
    if response_msg.tool_calls:
        messages.append(response_msg)
        last_func_name = None
        last_tool_res = None
        for tool_call in response_msg.tool_calls:
            function_name = tool_call.function.name
            last_func_name = function_name
            func = TOOL_FUNCTIONS_MAP.get(function_name)
            if func:
                args = _coerce_args(function_name, json.loads(tool_call.function.arguments))
                cache_key = f"{function_name}:{json.dumps(args, sort_keys=True)}"
                tool_result = None
                if function_name in CACHEABLE:
                    tool_result = _cache_get(cache_key)
                    if tool_result:
                        logger.info(f"Cache HIT for {function_name}")
                if tool_result is None:
                    tool_result = await func(**args)
                    if function_name in CACHEABLE:
                        _cache_set(cache_key, tool_result)
                last_tool_res = tool_result
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": function_name,
                    "content": json.dumps(tool_result)
                })

        if last_func_name and last_tool_res is not None:
            return await _narrate(last_func_name, last_tool_res, message)

    # --- Fallback: model returned JSON or XML tags in text instead of tool_calls ---
    elif response_msg.content:
        content_str = response_msg.content.strip()
        
        # 1. Check for XML-style tags: <function=name>{"param": "val"}</function>
        # Or even simpler: <function=name>{"param": "val"}>
        import re
        # Support various delimiters: <function=...>, (function=...), [function=...]
        xml_pattern = r'(?:<|\(|\{|\[|/|\\)function[=\s:>]*(\w+)[=\s>]*({.+?})(?:>|\)|\{|\]|/|\\)*'
        match = re.search(xml_pattern, content_str, re.DOTALL)
        if match:
            func_name, args_str = match.group(1), match.group(2)
            try:
                args = json.loads(args_str)
                func = TOOL_FUNCTIONS_MAP.get(func_name)
                if func:
                    logger.info(f"Caught XML tool leak: {func_name}")
                    args = _coerce_args(func_name, args)
                    tool_result = await func(**args)
                    return await _narrate(func_name, tool_result, message)
            except Exception as e:
                logger.error(f"Failed to parse leaked XML tool call: {e}")

        # 2. Check for raw JSON object
        if content_str.startswith("{") and content_str.endswith("}"):
            try:
                parsed_json = json.loads(content_str)
                if "name" in parsed_json and "parameters" in parsed_json:
                    function_name = parsed_json["name"]
                    func = TOOL_FUNCTIONS_MAP.get(function_name)
                    if func:
                        logger.info(f"Caught JSON tool leak: {function_name}")
                        tool_result = await func(**parsed_json["parameters"])
                        return await _narrate(function_name, tool_result, message)
            except json.JSONDecodeError:
                pass

    return response_msg.content or "I couldn't understand that. Can you please rephrase?"


# ---------------------------------------------------------------------------
# Legacy alias – keeps any existing callers working without changes
# ---------------------------------------------------------------------------
async def process_farmer_query(message: str, history: list = None) -> str:
    """
    Backward-compatible wrapper.  New code should use the channel-specific
    agents (whatsapp_agent / web_agent) instead.
    """
    from app.core.web_agent import WEB_SYSTEM_PROMPT
    return await process_query_base(message, system_prompt=WEB_SYSTEM_PROMPT, history=history)
