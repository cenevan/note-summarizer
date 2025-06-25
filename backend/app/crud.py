# app/crud.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas
from fastapi import HTTPException
from app import auth

def create_note(db: Session, title: str, content: str, summary: str, action_items: str, created_at: str, tags: list[str], user_id: int) -> models.Note:
    tag_objs = db.query(models.Tag).filter(models.Tag.name.in_(tags), models.Tag.user_id == user_id).all()
    note = models.Note(
        name=title,
        content=content,
        summary=summary,
        action_items=action_items,
        created_at=created_at,
        updated_at=created_at,
        tags=tag_objs,
        user_id=user_id
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

def get_notes(db: Session, tags: list[str] | None, user_id: int) -> list[models.Note]:
    query = db.query(models.Note).filter(models.Note.user_id == user_id)
    if tags:
        query = query.join(models.Note.tags).filter(models.Tag.name.in_(tags)).distinct()
    return query.all()

def search_notes(db: Session, query: str, user_id: int) -> list[models.Note]:
    if not query:
        return db.query(models.Note).filter(models.Note.user_id == user_id).all()
    
    return (
        db.query(models.Note)
        .filter(
            models.Note.user_id == user_id,
            (models.Note.name.ilike(f"%{query}%") | models.Note.content.ilike(f"%{query}%"))
        )
        .all()
    )

def delete_note(db: Session, note_id: int, user_id: int) -> None:
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == user_id).first()
    if note:
        db.delete(note)
        db.commit()
    else:
        raise ValueError("Note not found")
    
def get_note_by_id(db: Session, note_id: int, user_id: int) -> models.Note | None:
    return db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == user_id).first()

def update_note(
    db: Session,
    note_id: int,
    title: str | None = None,
    content: str | None = None,
    summary: str | None = None,
    updated_at: str | None = None,
    action_items: str | None = None,
    user_id: int = None
) -> models.Note | None:
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == user_id).first()
    if not note:
        return None

    if title is not None:
        note.name = title
    if content is not None:
        note.content = content
    if summary is not None:
        note.summary = summary
    if action_items is not None:
        note.action_items = action_items
    if updated_at is not None:
        note.updated_at = updated_at

    db.commit()
    db.refresh(note)
    return note

def create_tag(db: Session, tag: schemas.TagCreate, user_id: int):
    db_tag = models.Tag(name=tag.name, color=tag.color, user_id=user_id)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def get_tags(db: Session, user_id: int) -> list[models.Tag]:
    return db.query(models.Tag).filter(models.Tag.user_id == user_id).all()

def get_tag_for_note(db: Session, note_id: int, user_id: int) -> list[models.Tag]:
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == user_id).first()
    if not note:
        return []
    return note.tags

def get_notes_by_tags(db: Session, tags: list[str], user_id: int) -> list[models.Note]:
    if not tags:
        return db.query(models.Note).filter(models.Note.user_id == user_id).all()
    return (
        db.query(models.Note)
        .join(models.Note.tags)
        .filter(models.Tag.name.in_(tags), models.Note.user_id == user_id)
        .group_by(models.Note.id)
        .having(func.count(models.Tag.id) == len(tags))
        .all()
    )

def delete_tag(db: Session, tag_id: int, user_id: int):
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id, models.Tag.user_id == user_id).first()
    if tag:
        db.delete(tag)
        db.commit()
    return tag

def assign_tag_to_note(db: Session, note_id: int, tag_id: int, user_id: int) -> models.Note | None:
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == user_id).first()
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id, models.Tag.user_id == user_id).first()

    if not note or not tag:
        return None

    if tag not in note.tags:
        note.tags.append(tag)
        db.commit()
        db.refresh(note)

    return note

def remove_tag_from_note(db: Session, note_id: int, tag_id: int, user_id: int) -> models.Note | None:
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == user_id).first()
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id, models.Tag.user_id == user_id).first()

    if not note or not tag:
        return None

    if tag in note.tags:
        note.tags.remove(tag)
        db.commit()
        db.refresh(note)

    return note

def register_user(db: Session, user: schemas.UserCreate):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed = auth.hash_password(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed,
        openai_api_key=user.openai_api_key
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, identifier: str, password: str):
    user = db.query(models.User).filter(
        (models.User.email == identifier) | (models.User.username == identifier)
    ).first()

    if user and auth.verify_password(password, user.hashed_password):
        return user
    return None

def update_user_api_key(db: Session, user_id: int, new_key: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.openai_api_key = new_key
    db.commit()
    return {"msg": "API key updated"}

def update_user_password(db: Session, user_id: int, new_password: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    hashed_password = auth.hash_password(new_password)
    user.hashed_password = hashed_password
    db.commit()
    return {"msg": "Password updated successfully"}

def update_user_username(db: Session, user_id: int, new_username: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if db.query(models.User).filter(models.User.username == new_username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    user.username = new_username
    db.commit()
    return {"msg": "Username updated successfully"}

def update_user_email(db: Session, user_id: int, new_email: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if db.query(models.User).filter(models.User.email == new_email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user.email = new_email
    db.commit()
    return {"msg": "Email updated successfully"}

def get_api_usage(db: Session, user_id: int) -> list[models.ApiUsage]:
    return db.query(models.ApiUsage).filter(models.ApiUsage.user_id == user_id).all()

def create_api_usage(
    db: Session,
    user_id: int,
    note_id: int | None = None,
    usage_date: str = "",
    input_tokens: int = 0,
    output_tokens: int = 0
) -> models.ApiUsage:
    api_usage = models.ApiUsage(
        user_id=user_id,
        note_id=note_id,
        usage_date=usage_date,
        input_tokens=input_tokens,
        output_tokens=output_tokens
    )
    db.add(api_usage)
    db.commit()
    db.refresh(api_usage)
    return api_usage