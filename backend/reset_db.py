# reset_db.py
# docker-compose exec backend python reset_db.py
from app.database import Base, engine
from app import models

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
