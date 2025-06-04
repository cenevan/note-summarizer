# app/crud.py
from sqlalchemy.orm import Session
from app import models, schemas

def create_note(db: Session, filename: str, content: str, summary: str, action_items: str) -> models.Note:
    note = models.Note(
        filename=filename,
        content=content,
        summary=summary,
        action_items=action_items
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

def get_all_notes(db: Session) -> list[models.Note]:
    return db.query(models.Note).all()