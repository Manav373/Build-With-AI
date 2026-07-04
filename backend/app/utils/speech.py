import httpx
import logging
import io
import os
from groq import AsyncGroq

logger = logging.getLogger("KrishiMCP.Speech")

async def transcribe_audio(audio_url: str) -> str:
    """
    Downloads audio from Twilio and transcribes it using Groq's Whisper model.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.error("GROQ_API_KEY missing for transcription.")
        return ""

    try:
        # 1. Download audio from Twilio
        async with httpx.AsyncClient() as client:
            response = await client.get(audio_url, follow_redirects=True)
            if response.status_code != 200:
                logger.error(f"Failed to download audio: {response.status_code}")
                return ""
            
            audio_bytes = response.content
            # Detect extension from Content-Type if possible, default to .ogg
            content_type = response.headers.get("Content-Type", "audio/ogg")
            # Groq's API expects a file-like object with a filename for format detection
            extension = "ogg" if "ogg" in content_type else "mp3"
            filename = f"audio.{extension}"

        # 2. Transcribe with Groq Whisper
        groq_client = AsyncGroq(api_key=api_key)
        
        # Whisper transcription
        # We wrap the bytes in an io.BytesIO and give it a name so the model knows the format
        transcription = await groq_client.audio.transcriptions.create(
            file=(filename, audio_bytes),
            model="whisper-large-v3-turbo",
            response_format="text"
        )
        
        logger.info(f"Transcription successful: {transcription[:50]}...")
        return transcription.strip()

    except Exception as e:
        logger.error(f"Error in speech transcription: {str(e)}")
        return ""

async def transcribe_audio_bytes(audio_bytes: bytes, filename: str = "audio.wav") -> str:
    """
    Transcribes raw audio bytes using Groq's Whisper model.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.error("GROQ_API_KEY missing for transcription bytes.")
        return ""

    try:
        groq_client = AsyncGroq(api_key=api_key)
        transcription = await groq_client.audio.transcriptions.create(
            file=(filename, audio_bytes),
            model="whisper-large-v3-turbo",
            response_format="text"
        )
        return transcription.strip()
    except Exception as e:
        logger.error(f"Error in transcribe_audio_bytes: {str(e)}")
        return ""
