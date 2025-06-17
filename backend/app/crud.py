# app/crud.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas
from fastapi import HTTPException
from app import auth

def create_note(db: Session, title: str, content: str, summary: str, action_items: str, created_at: str, tags: list[str]) -> models.Note:
    tag_objs = db.query(models.Tag).filter(models.Tag.name.in_(tags)).all()

    note = models.Note(
        name=title,
        content=content,
        summary=summary,
        action_items=action_items,
        created_at=created_at,
        updated_at=created_at,
        tags=tag_objs
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

def get_notes(db: Session, tags: list[str] | None = None) -> list[models.Note]:
    query = db.query(models.Note)
    if tags:
        query = query.join(models.Note.tags).filter(models.Tag.name.in_(tags)).distinct()
    return query.all()

def delete_note(db: Session, note_id: int) -> None:
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if note:
        db.delete(note)
        db.commit()
    else:
        raise ValueError("Note not found")
    
def get_note_by_id(db: Session, note_id: int) -> models.Note | None:
    return db.query(models.Note).filter(models.Note.id == note_id).first()

def update_note(
    db: Session,
    note_id: int,
    title: str | None = None,
    content: str | None = None,
    summary: str | None = None,
    updated_at: str | None = None,
    action_items: str | None = None
) -> models.Note | None:
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
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

def create_tag(db: Session, tag: schemas.TagCreate):
    db_tag = models.Tag(name=tag.name, color=tag.color)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def get_tags(db: Session) -> list[models.Tag]:
    return db.query(models.Tag).all()

def get_tag_for_note(db: Session, note_id: int) -> list[models.Tag]:
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        return []
    return note.tags

def get_notes_by_tags(db: Session, tags: list[str]) -> list[models.Note]:
    if not tags:
        return db.query(models.Note).all()
    return (
        db.query(models.Note)
        .join(models.Note.tags)
        .filter(models.Tag.name.in_(tags))
        .group_by(models.Note.id)
        .having(func.count(models.Tag.id) == len(tags))
        .all()
    )

def delete_tag(db: Session, tag_id: int):
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    if tag:
        db.delete(tag)
        db.commit()
    return tag

def assign_tag_to_note(db: Session, note_id: int, tag_id: int) -> models.Note | None:
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()

    if not note or not tag:
        return None

    if tag not in note.tags:
        note.tags.append(tag)
        db.commit()
        db.refresh(note)

    return note

def remove_tag_from_note(db: Session, note_id: int, tag_id: int) -> models.Note | None:
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()

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

def update_user_api_key(db: Session, current_user_email: str, new_key: str):
    user = db.query(models.User).filter(models.User.email == current_user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.openai_api_key = new_key
    db.commit()
    return {"msg": "API key updated"}