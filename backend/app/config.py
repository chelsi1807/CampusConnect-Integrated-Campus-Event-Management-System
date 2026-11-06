import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusConnect"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./campusconnect.db")
    
    # JWT & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "campusconnect_ultra_secure_jwt_secret_key_2026_super_safe_key_384729")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Certificate & QR
    CERTIFICATE_DIR: str = os.getenv("CERTIFICATE_DIR", "certificates")
    QR_DIR: str = os.getenv("QR_DIR", "qr_codes")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    
    # Server / Base URL for QR verification
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:5173")
    
    # SMTP / Notifications
    SMTP_SERVER: Optional[str] = os.getenv("SMTP_SERVER", None)
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER", None)
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", None)
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@campusconnect.edu")
    
    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
