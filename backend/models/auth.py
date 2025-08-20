from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    """User registration model"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    """User login model"""
    username: str
    password: str

class UserResponse(BaseModel):
    """User response model"""
    id: str
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool

class TokenResponse(BaseModel):
    """Token response model"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserUpdate(BaseModel):
    """User update model"""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
