from app.routes.admin.organizations import router as organizations_router
from app.routes.admin.users import router as users_router
from app.routes.admin.platform import router as platform_router

__all__ = ["organizations_router", "users_router", "platform_router"]