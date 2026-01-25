from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.models.sql import User
from app.models.auth import RegisterRequest, LoginRequest, TokenResponse, UserPublic

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def require_db(db: Session = Depends(get_db)) -> Session:
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        )
    return db


def build_user_public(user: User) -> UserPublic:
    return UserPublic(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
    )


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(require_db)):
    username = payload.username.strip()
    email = payload.email.strip().lower()

    if "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address",
        )

    existing = db.query(User).filter(
        or_(User.email == email, User.username == username)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists",
        )

    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(payload.password),
        role="analyst",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        {"sub": str(user.id), "user_id": user.id, "email": user.email, "role": user.role}
    )
    return TokenResponse(access_token=token, user=build_user_public(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(require_db)):
    identifier = payload.email.strip().lower()
    user = db.query(User).filter(User.email == identifier).first()
    if not user:
        user = db.query(User).filter(User.username == identifier).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    token = create_access_token(
        {"sub": str(user.id), "user_id": user.id, "email": user.email, "role": user.role}
    )
    return TokenResponse(access_token=token, user=build_user_public(user))


@router.get("/me", response_model=UserPublic)
def me(token: str = Depends(oauth2_scheme), db: Session = Depends(require_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return build_user_public(user)
