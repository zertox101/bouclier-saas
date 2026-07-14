from typing import List, Optional, Type
from sqlalchemy.orm import Session, Query
from sqlalchemy import text

from app.models.sql import User, Organization
from app.core.rbac.permissions import get_permissions_for_role, role_has_permission


class AuthorizationService:
    def __init__(self, db: Session):
        self.db = db

    def can_access_organization(self, user: User, target_org_id: str) -> bool:
        if user.role == "SUPER_ADMIN":
            return True
        return str(user.org_id) == target_org_id

    def can_impersonate_organization(self, user: User) -> bool:
        return user.role == "SUPER_ADMIN"

    def get_accessible_org_ids(self, user: User) -> List[str]:
        if user.role == "SUPER_ADMIN":
            orgs = self.db.query(Organization.id).all()
            return [str(o[0]) for o in orgs]
        if user.org_id:
            return [str(user.org_id)]
        return []

    def filter_query_by_access(self, user: User, query: Query, model: Type) -> Query:
        if user.role == "SUPER_ADMIN":
            return query

        if user.org_id and hasattr(model, 'org_id'):
            query = query.filter(model.org_id == user.org_id)
        return query

    def can_perform_action(
        self,
        user: User,
        action: str,
        resource_type: str,
        org_id: str = None,
    ) -> bool:
        if user.role == "SUPER_ADMIN":
            return True

        target_org = org_id or (str(user.org_id) if user.org_id else None)
        if not target_org or not self.can_access_organization(user, target_org):
            return False

        perm = f"{resource_type}:{action}"
        return role_has_permission(user.role, perm)

    def get_user_permissions(self, user: User) -> List[str]:
        return get_permissions_for_role(user.role)

    def user_has_permission(self, user: User, permission: str) -> bool:
        if user.role == "SUPER_ADMIN":
            return True
        return permission in get_permissions_for_role(user.role)