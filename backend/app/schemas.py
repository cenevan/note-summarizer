# app/schemas.py
from pydantic import BaseModel

class NoteBase(BaseModel):
    name: str
    content: str
    summary: str
    action_items: str

class NoteCreate(NoteBase):
    pass

class Note(NoteBase):
    id: int

    class Config:
        orm_mode = True
