from app import app
from models import db

# This creates the application context so SQLAlchemy knows which app it is working with
with app.app_context():
    db.create_all()
    print("Database tables created successfully!")