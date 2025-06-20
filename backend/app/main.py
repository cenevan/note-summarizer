from fastapi import FastAPI, UploadFile, File, Form, Depends, Query, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, get_db
from app.summarizer import summarize_text
from app import crud, schemas, auth
from sqlalchemy.orm import Session
from typing import Optional
from sqlalchemy.exc import IntegrityError
import io

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup_event():
    init_db()

@app.post("/upload/", response_model=schemas.Note)
async def upload_note(
    file: UploadFile = File(...),
    title: str = Form(...),
    include_action_items: bool = Form(True),
    created_at: Optional[str] = Form(None),
    tags: list[str] = Form(default=[]),
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    content = (await file.read()).decode("utf-8")
    try:
        summary, action_items = summarize_text(content, current_user.openai_api_key, include_action_items)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    db_note = crud.create_note(db, title, content, summary, action_items, created_at, tags, current_user.id)
    return db_note

@app.get("/notes/", response_model=list[schemas.Note])
def get_notes(
    tags: Optional[list[str]] = Query(None),
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    return crud.get_notes(db, tags, current_user.id)

@app.delete("/notes/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    crud.delete_note(db, note_id, current_user.id)
    return {"message": "Note deleted successfully"}

@app.get("/notes/{note_id}", response_model=schemas.Note)
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    note = crud.get_note_by_id(db, note_id, current_user.id)
    if not note:
        return {"error": "Note not found"}
    return note

@app.put("/notes/{note_id}", response_model=schemas.Note)
def update_note(
    note_id: int,
    request: schemas.NoteUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    try:
        summary, action_items = summarize_text(request.content, current_user.openai_api_key, request.include_action_items)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    updated_note = crud.update_note(db, note_id, None, request.content, summary, request.updated_at, action_items, current_user.id)
    if not updated_note:
        return {"error": "Note not found"}
    return updated_note

@app.put("/notes/{note_id}/name", response_model=schemas.Note)
def update_note_name(
    note_id: int,
    request: schemas.NoteUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    updated_note = crud.update_note(db, note_id, title=request.name, updated_at=request.updated_at, user_id=current_user.id)
    if not updated_note:
        return {"error": "Note not found"}
    return updated_note

@app.post("/tags/", response_model=schemas.Tag)
def create_tag(
    tag_in: schemas.TagCreate,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    try:
        return crud.create_tag(db, tag_in, current_user.id)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Tag already exists")

@app.get("/tags/", response_model=list[schemas.Tag])
def get_all_tags(
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    return crud.get_tags(db, current_user.id)

@app.get("/tags/{note_id}", response_model=list[schemas.Tag])
def get_tags_for_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    tags = crud.get_tag_for_note(db, note_id, current_user.id)
    return tags

@app.get("/notes/tags/", response_model=list[schemas.Note])
def get_notes_by_tags(
    tags: list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    notes = crud.get_notes_by_tags(db, tags, current_user.id)
    return notes

@app.delete("/tags/{tag_id}", response_model=schemas.Tag)
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    deleted = crud.delete_tag(db, tag_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tag not found")
    return deleted

@app.post("/notes/{note_id}/tags/{tag_id}", response_model=schemas.Note)
def assign_tag_to_note(
    note_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    note = crud.assign_tag_to_note(db, note_id, tag_id, current_user.id)
    if not note:
        raise HTTPException(status_code=404, detail="Note or Tag not found")
    return note

@app.delete("/notes/{note_id}/tags/{tag_id}", response_model=schemas.Note)
def remove_tag_from_note(
    note_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    note = crud.remove_tag_from_note(db, note_id, tag_id, current_user.id)
    if not note:
        raise HTTPException(status_code=404, detail="Note or Tag not found")
    return note

@app.post("/register/")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    new_user = crud.register_user(db, user)
    access_token = auth.create_access_token(data={"sub": str(new_user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    access_token = auth.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@app.put("/users/me/api-key")
def update_api_key(
    data: schemas.UpdateAPIKey, 
    db: Session = Depends(get_db), 
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    return crud.update_user_api_key(db, current_user.id, data.new_key)

@app.put("/users/me/password")
def update_password(
    data: schemas.UpdatePassword,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    if not data.new_password:
        raise HTTPException(status_code=400, detail="New password cannot be empty")
    return crud.update_user_password(db, current_user.id, data.new_password)

@app.put("/users/me/username")
def update_username(
    data: schemas.UpdateUsername,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    if not data.new_username:
        raise HTTPException(status_code=400, detail="New username cannot be empty")
    return crud.update_user_username(db, current_user.id, data.new_username)

@app.put("/users/me/email")
def update_email(
    data: schemas.UpdateEmail,
    db: Session = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user)
):
    if not data.new_email:
        raise HTTPException(status_code=400, detail="New email cannot be empty")
    return crud.update_user_email(db, current_user.id, data.new_email)

@app.get("/users/me")
def get_current_user_info(current_user: schemas.UserOut = Depends(auth.get_current_user)):
    return current_user