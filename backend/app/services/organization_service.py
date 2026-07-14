from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.sql import Organization, User
from app.services.base_tenant_service import BaseTenantService


class OrganizationService(BaseTenantService[Organization]):
    def __init__(self, db: Session):
        super().__init__(db, Organization)
    
    def list_all(self) -> List[Organization]:
        """SUPER_ADMIN only - list all organizations without tenant filter."""
        return self.db.query(Organization).all()
    
    def get_by_slug(self, slug: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.slug == slug).first()
    
    def get_by_id(self, org_id: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.id == org_id).first()
    
    def create_organization(self, name: str, slug: str, plan: str = "FREE") -> Organization:
        org = Organization(
            name=name,
            slug=slug,
            plan=plan,
            subscription_status="ACTIVE" if plan != "FREE" else "INACTIVE",
        )
        self.db.add(org)
        self.db.commit()
        self.db.refresh(org)
        return org
    
    def update_organization(self, org_id: str, data: dict) -> Optional[Organization]:
        org = self.get_by_id(org_id)
        if not org:
            return None
        
        for key, value in data.items():
            if hasattr(org, key):
                setattr(org, key, value)
        
        self.db.commit()
        self.db.refresh(org)
        return org
    
    def delete_organization(self, org_id: str) -> bool:
        org = self.get_by_id(org_id)
        if not org:
            return False
        
        self.db.delete(org)
        self.db.commit()
        return True
    
    def get_user_count(self, org_id: str) -> int:
        return self.db.query(User).filter(User.org_id == org_id).count()