from fastapi import HTTPException, Depends, status
from typing import Optional
from database.models import User
from auth.security import get_current_active_user

class RoleChecker:
    """Role-based permission checker"""
    
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles
    
    def __call__(self, current_user: User = Depends(get_current_active_user)):
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role}' not authorized. Required roles: {self.allowed_roles}"
            )
        return current_user

def require_admin(current_user: User = Depends(get_current_active_user)):
    """Require admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_manager_or_admin(current_user: User = Depends(get_current_active_user)):
    """Require manager or admin role"""
    if current_user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager or Admin access required"
        )
    return current_user

def check_resource_owner_or_manager(user_id: str, current_user: User = Depends(get_current_active_user)):
    """Check if user is resource owner, manager, or admin"""
    if current_user.role in ["manager", "admin"]:
        return True
    if current_user.id == user_id:
        return True
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You can only access your own data"
    )

def get_accessible_user_ids(current_user: User = Depends(get_current_active_user)) -> Optional[list]:
    """Get list of user IDs that current user can access"""
    if current_user.role in ["manager", "admin"]:
        return None  # Can access all users
    return [current_user.id]  # Can only access own data