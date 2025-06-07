# app/models.py
from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    content = Column(Text)
    summary = Column(Text)
    action_items = Column(Text)
