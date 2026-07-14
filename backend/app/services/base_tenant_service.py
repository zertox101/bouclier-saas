from typing import TypeVar, Generic, Type, List, Optional
from sqlalchemy.orm import Session, Query
from sqlalchemy import and_

from app.models.sql import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseTenantService(Generic[ModelType]):
    """Base service with automatic tenant isolation."""
    
    def __init__(self, db: Session, model_class: Type[ModelType]):
        self.db = db
        self.model = model_class
    
    def _base_query(self, org_id: Optional[str]) -> Query:
        query = self.db.query(self.model)
        if org_id and hasattr(self.model, 'org_id'):
            query = query.filter(self.model.org_id == org_id)
        return query
    
    def list(self, org_id: Optional[str], **filters) -> List[ModelType]:
        query = self._base_query(org_id)
        for key, value in filters.items():
            if hasattr(self.model, key) and value is not None:
                query = query.filter(getattr(self.model, key) == value)
        return query.all()
    
    def get(self, org_id: Optional[str], id: int) -> Optional[ModelType]:
        query = self._base_query(org_id)
        return query.filter(self.model.id == id).first()
    
    def create(self, org_id: str, data: dict, user_id: int = None) -> ModelType:
        obj_data = data.copy()
        obj_data['org_id'] = org_id
        if user_id and hasattr(self.model, 'created_by'):
            obj_data['created_by'] = user_id
        obj = self.model(**obj_data)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj
    
    def update(self, org_id: str, id: int, data: dict, user_id: int = None) -> Optional[ModelType]:
        obj = self.get(org_id, id)
        if not obj:
            return None
        
        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        
        if user_id and hasattr(self.model, 'updated_by'):
            obj.updated_by = user_id
        
        self.db.commit()
        self.db.refresh(obj)
        return obj
    
    def delete(self, org_id: str, id: int) -> bool:
        obj = self.get(org_id, id)
        if not obj:
            return False
        
        self.db.delete(obj)
        self.db.commit()
        return True