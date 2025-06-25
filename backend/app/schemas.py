# app/schemas.py
from pydantic import BaseModel
from pydantic import model_validator
from typing import Optional

class NoteBase(BaseModel):
    name: str
    content: str
    summary: str
    action_items: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class NoteCreate(NoteBase):
    pass

class Note(NoteBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

class NoteUpdate(BaseModel):
    name: str | None = None
    content: str | None = None
    summary: str | None = None
    action_items: str | None = None
    include_action_items: Optional[bool] = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        orm_mode = True

class TagBase(BaseModel):
    name: str
    color: Optional[str] = "#D1D5DB"  # Default color

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    openai_api_key: str | None = None

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    openai_api_key: str | None = None

    class Config:
        orm_mode = True

class UpdateUsername(BaseModel):
    new_username: str

class UpdateEmail(BaseModel):
    new_email: str

class UpdatePassword(BaseModel):
    old_password: str
    new_password: str

class UpdateAPIKey(BaseModel):
    new_key: str

class ApiUsageBase(BaseModel):
    usage_date: str
    input_tokens: int = 0
    output_tokens: int = 0

class ApiUsageCreate(ApiUsageBase):
    user_id: int
    note_id: Optional[int] = None

class ApiUsage(ApiUsageBase):
    id: int
    user_id: int
    note_id: Optional[int] = None

    class Config:
        orm_mode = True