from app.db.base import Base
from app.db.session import engine
import app.models.user
import app.models.project
import app.models.github

def init():
    print("Creating Sprint 5 tables...")
    Base.metadata.create_all(bind=engine)
    print("Sprint 5 database tables initialized successfully.")

if __name__ == "__main__":
    init()
