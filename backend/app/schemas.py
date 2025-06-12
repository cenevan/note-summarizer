# app/schemas.py
from pydantic import BaseModel
from typing import Optional

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

class NoteUpdate(BaseModel):
    name: str | None = None
    content: str | None = None
    summary: str | None = None
    action_items: str | None = None
    include_action_items: Optional[bool] = True

    class Config:
        orm_mode = True

class TagBase(BaseModel):
    name: str
    color: Optional[str] = "#D1D5DB"  # Default color

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int

    class Config:
        orm_mode = True