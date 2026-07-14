from typing import List, Optional
from fastapi import Depends, HTTPException, Header, status, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.sql import User
from app.core.rbac.permissions import get_permissions_for_role, role_has_permission


class PermissionChecker:
    def __init__(self, required_permissions: List[str], require_all: bool = True):
        self.required = required_permissions
        self.require_all = require_all

    async def __call__(
        self,
        request: Request,
        db: Session = Depends(get_db),
    ) -> User:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )

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
                detail="Invalid token payload",
            )

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is inactive",
            )

        user_permissions = get_permissions_for_role(user.role)

        if self.require_all:
            missing = [p for p in self.required if p not in user_permissions]
        else:
            missing = [] if any(p in user_permissions for p in self.required) else self.required

        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permissions: {', '.join(missing)}",
            )

        request.state.current_user = user
        return user


async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not found or inactive",
        )

    request.state.current_user = user
    return user


async def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return None

    payload = decode_access_token(token)
    if not payload:
        return None

    user_id = payload.get("user_id")
    if not user_id:
        return None

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        return None

    request.state.current_user = user
    return user


async def get_current_org_id(
    request: Request,
    current_user: User = Depends(get_current_user),
    x_org_id: Optional[str] = Header(None, alias="X-Organization-ID"),
) -> Optional[str]:
    if current_user.role == "SUPER_ADMIN":
        if x_org_id:
            return x_org_id
        return None

    if x_org_id and x_org_id != str(current_user.org_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other organizations",
        )

    if not current_user.org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not assigned to any organization",
        )

    return str(current_user.org_id)


async def get_current_org_id_required(
    org_id: Optional[str] = Depends(get_current_org_id),
) -> str:
    if org_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization context required",
        )
    return org_id


def require_permission(*permissions: str):
    return PermissionChecker(list(permissions), require_all=True)


def require_any_permission(*permissions: str):
    return PermissionChecker(list(permissions), require_all=False)