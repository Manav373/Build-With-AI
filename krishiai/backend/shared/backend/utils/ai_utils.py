import json
import os
import logging
from groq import AsyncGroq

logger = logging.getLogger("Shared.AIUtils")

async def fetch_structured_agri_data(prompt: str, model: str = "llama-3.3-70b-versatile") -> dict:
    """
    Sends a prompt to the LLM expecting a structured JSON response.
    Used to replace hardcoded data lookups with dynamic AI knowledge.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        logger.error("GROQ_API_KEY missing for AI data fetch")
        return {"error": "AI service unavailable (missing API key)"}

    client = AsyncGroq(api_key=groq_api_key, max_retries=0)
    
    system_prompt = (
        "You are an expert Indian Agricultural Information System. "
        "Your task is to provide accurate, up-to-date information in strictly valid JSON format. "
        "Do not include any preamble or post-text. Only output JSON."
    )

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        if "429" in str(e) or "rate_limit" in str(e).lower():
            fallback_model = "llama-3.1-8b-instant"
            logger.warning(f"Rate limit hit for {model}. Falling back to {fallback_model}.")
            try:
                response = await client.chat.completions.create(
                    model=fallback_model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                return json.loads(response.choices[0].message.content)
            except Exception as fe:
                logger.error(f"Fallback also failed: {fe}")
        
        logger.error(f"Error fetching structured AI data: {e}")
        return {"error": "Failed to retrieve AI data"}

async def fetch_agri_text(prompt: str, model: str = "llama-3.1-8b-instant") -> str:
    """Fetch a simple text response from the LLM."""
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        return "AI service unavailable (missing API key)"

    client = AsyncGroq(api_key=groq_api_key)
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful Indian Agricultural advisor. Answer concisely."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error fetching AI text: {e}")
        return "Error retrieving AI summary."

def clean_input(text: str) -> str:
    return text.strip().lower() if text else "unknown"
