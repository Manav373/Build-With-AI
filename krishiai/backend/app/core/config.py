from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    OPENWEATHER_API_KEY: str
    GEMINI_API_KEY: str
    GROQ_API_KEY: str
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    MOCK_WHATSAPP: bool = True
    
    PROJECT_NAME: str = "KrishiAI"
    VERSION: str = "1.0.0"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
