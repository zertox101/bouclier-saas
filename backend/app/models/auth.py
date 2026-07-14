from pydantic import BaseModel, Field
from typing import List, Optional


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    org_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


class UserPublic(BaseModel):
    id: int
    username: str
    email: str
    role: str
    org_id: Optional[str] = None
    permissions: List[str] = []


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
