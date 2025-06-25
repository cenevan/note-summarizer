# app/models.py
from sqlalchemy import Table, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

note_tags = Table(
    "note_tags",
    Base.metadata,
    Column("note_id", Integer, ForeignKey("notes.id")),
    Column("tag_id", Integer, ForeignKey("tags.id")),
)

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    color = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="tags")
    notes = relationship("Note", secondary=note_tags, back_populates="tags")

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    content = Column(Text)
    summary = Column(Text)
    action_items = Column(Text)
    created_at = Column(String, index=True)
    updated_at = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="notes")
    tags = relationship("Tag", secondary=note_tags, back_populates="notes")
    api_usage = relationship("ApiUsage", back_populates="note")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    openai_api_key = Column(String, nullable=True)  # Optional at signup
    notes = relationship("Note", back_populates="user")
    tags = relationship("Tag", back_populates="user")
    api_usage = relationship("ApiUsage", back_populates="user")

class ApiUsage(Base):
    __tablename__ = "api_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=False)
    user = relationship("User", back_populates="api_usage")
    note = relationship("Note", back_populates="api_usage")
    usage_date = Column(String, index=True)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
