from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.category import Category
from app.models.event import Event
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.auth_service import require_role

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    admin_user = Depends(require_role(["admin"]))
):
    existing = db.query(Category).filter(Category.name.ilike(category_in.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    category = Category(**category_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    admin_user = Depends(require_role(["admin"]))
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    for key, value in category_in.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
        
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin_user = Depends(require_role(["admin"]))
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    # Check if events use this category
    event_count = db.query(Event).filter(Event.category_id == category_id).count()
    if event_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete category: {event_count} events are linked to it. Please reassign them first."
        )
        
    db.delete(category)
    db.commit()
    return None

