from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, get_db
from app.summarizer import summarize_text
from app import crud, schemas
from sqlalchemy.orm import Session
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
    db: Session = Depends(get_db)
):
    content = (await file.read()).decode("utf-8")
    summary, action_items = summarize_text(content, include_action_items)
    db_note = crud.create_note(db, title, content, summary, action_items)
    return {"summary": summary, "action_items": action_items}

@app.get("/notes/", response_model=list[schemas.Note])
def get_notes(db: Session = Depends(get_db)):
    return crud.get_all_notes(db)

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