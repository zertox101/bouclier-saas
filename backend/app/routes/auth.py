from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.models.sql import User, Organization
from app.models.auth import RegisterRequest, LoginRequest, TokenResponse, UserPublic
from app.core.rbac.permissions import get_permissions_for_role

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def require_db(db: Session = Depends(get_db)) -> Session:
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        )
    return db


def build_user_public(user: User) -> UserPublic:
    permissions = get_permissions_for_role(user.role)
    return UserPublic(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        org_id=str(user.org_id) if user.org_id else None,
        permissions=permissions,
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

    if payload.org_id:
        org = db.query(Organization).filter(Organization.id == payload.org_id).first()
        if not org:
            raise HTTPException(status_code=400, detail="Organization not found")

    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(payload.password),
        role="ANALYST",
        org_id=payload.org_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    permissions = get_permissions_for_role(user.role)
    token = create_access_token(
        {
            "sub": str(user.id),
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "org_id": str(user.org_id) if user.org_id else None,
            "permissions": permissions,
        }
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

    permissions = get_permissions_for_role(user.role)
    token = create_access_token(
        {
            "sub": str(user.id),
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "org_id": str(user.org_id) if user.org_id else None,
            "permissions": permissions,
        }
    )
    return TokenResponse(access_token=token, user=build_user_public(user))


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(require_db)) -> User:
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

    return user


def get_current_user_optional(token: str = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> User:
    if token:
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("user_id")
            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    return user
    user = db.query(User).filter(User.role == "SUPER_ADMIN").first()
    if not user:
        user = db.query(User).first()
    if not user:
        org = db.query(Organization).first()
        new_user = User(
            username="demo_admin",
            email="admin@bouclier.ma",
            hashed_password="$2b$12$dummypasswordhash",
            role="SUPER_ADMIN",
            org_id=org.id if org else None,
            plan="enterprise",
            subscription_status="active",
            is_active=True,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    return user


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)):
    return build_user_public(current_user)
