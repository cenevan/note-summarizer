# app/crud.py
from sqlalchemy.orm import Session
from app import models, schemas

def create_note(db: Session, title: str, content: str, summary: str, action_items: str) -> models.Note:
    note = models.Note(
        name=title,
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

    db.commit()
    db.refresh(note)
    return note