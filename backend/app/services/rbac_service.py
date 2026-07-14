from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.sql import User
from app.core.rbac.permissions import get_permissions_for_role, role_has_permission


class RBACService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_permissions(self, user: User) -> List[str]:
        return get_permissions_for_role(user.role)
    
    def user_has_permission(self, user: User, permission: str) -> bool:
        return role_has_permission(user.role, permission)
    
    def get_user_org_id(self, user: User) -> Optional[str]:
        return str(user.org_id) if user.org_id else None
    
    def can_access_org(self, user: User, target_org_id: str) -> bool:
        if user.role == "SUPER_ADMIN":
            return True
        return str(user.org_id) == target_org_id
    
    def get_accessible_org_ids(self, user: User) -> List[str]:
        if user.role == "SUPER_ADMIN":
            orgs = self.db.query(Organization.id).all()
            return [str(o[0]) for o in orgs]
        if user.org_id:
            return [str(user.org_id)]
        return []


# Import at bottom to avoid circular dependency
from app.models.sql import Organization