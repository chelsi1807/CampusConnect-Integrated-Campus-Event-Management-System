from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserAdminUpdate
from app.services.auth_service import require_role

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_pattern)) |
            (User.email.ilike(search_pattern)) |
            (User.student_id.ilike(search_pattern)) |
            (User.department.ilike(search_pattern))
        )
        
    return query.order_by(User.created_at.desc()).all()

@router.put("/{user_id}/status", response_model=UserResponse)
def toggle_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Prevent admin from deactivating themselves
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Administrator cannot deactivate their own account")
        
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}/role", response_model=UserResponse)
def change_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    if role not in ["student", "organizer", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.role = role
    db.commit()
    db.refresh(user)
    return user
