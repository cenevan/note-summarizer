from fastapi import FastAPI, UploadFile, File, Form, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, get_db
from app.summarizer import summarize_text
from app import crud, schemas
from sqlalchemy.orm import Session
from typing import Optional
from sqlalchemy.exc import IntegrityError
import io

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup_event():
    init_db()

@app.post("/upload/")
async def upload_note(
    file: UploadFile = File(...),
    title: str = Form(...),
    include_action_items: bool = Form(True),
    tags: list[str] = Form(default=[]),
    db: Session = Depends(get_db)
):
    content = (await file.read()).decode("utf-8")
    summary, action_items = summarize_text(content, include_action_items)
    db_note = crud.create_note(db, title, content, summary, action_items, tags)
    return {"summary": summary, "action_items": action_items}

@app.get("/notes/", response_model=list[schemas.Note])
def get_notes(tags: Optional[list[str]] = Query(None), db: Session = Depends(get_db)):
    return crud.get_notes(db, tags)

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    crud.delete_note(db, note_id)
    return {"message": "Note deleted successfully"}

@app.get("/notes/{note_id}", response_model=schemas.Note)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = crud.get_note_by_id(db, note_id)
    if not note:
        return {"error": "Note not found"}
    return note

@app.put("/notes/{note_id}", response_model=schemas.Note)
def update_note(
    note_id: int,
    request: schemas.NoteUpdate,
    db: Session = Depends(get_db)
):
    summary, action_items = summarize_text(request.content, request.include_action_items)
    updated_note = crud.update_note(db, note_id, None, request.content, summary, action_items)
    if not updated_note:
        return {"error": "Note not found"}
    return updated_note

@app.put("/notes/{note_id}/name", response_model=schemas.Note)
def update_note_name(
    note_id: int,
    request: schemas.NoteUpdate,
    db: Session = Depends(get_db)
):
    updated_note = crud.update_note(db, note_id, title=request.name)
    if not updated_note:
        return {"error": "Note not found"}
    return updated_note

@app.post("/tags/", response_model=schemas.Tag)
def create_tag(
    tag_in: schemas.TagCreate,
    db: Session = Depends(get_db),
):
    try:
        return crud.create_tag(db, tag_in)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Tag already exists")

@app.get("/tags/", response_model=list[schemas.Tag])
def get_all_tags(db: Session = Depends(get_db)):
    return crud.get_tags(db)

@app.get("/tags/{note_id}", response_model=list[schemas.Tag])
def get_tags_for_note(note_id: int, db: Session = Depends(get_db)):
    tags = crud.get_tag_for_note(db, note_id)
    return tags

@app.delete("/tags/{tag_id}", response_model=schemas.Tag)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_tag(db, tag_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tag not found")
    return deleted

@app.post("/notes/{note_id}/tags/{tag_id}", response_model=schemas.Note)
def assign_tag_to_note(note_id: int, tag_id: int, db: Session = Depends(get_db)):
    note = crud.assign_tag_to_note(db, note_id, tag_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note or Tag not found")
    return note