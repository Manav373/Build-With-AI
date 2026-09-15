from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    OPENWEATHER_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    MOCK_WHATSAPP: bool = True
    
    PROJECT_NAME: str = "KrishiAI"
    VERSION: str = "2.0.0"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
