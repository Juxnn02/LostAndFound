"""
Run this once to fix the admin table:
    python migrate.py

The admin.user_id column was originally created as NOT NULL.
This script recreates the table with user_id nullable so standalone
admin accounts (not linked to a student) can be registered.
"""
from app import app
from sqlalchemy import text, inspect as sa_inspect

with app.app_context():
    from models import db

    inspector = sa_inspect(db.engine)
    columns = inspector.get_columns('admin')
    user_id_col = next((c for c in columns if c['name'] == 'user_id'), None)

    if user_id_col and not user_id_col.get('nullable', True):
        print("Fixing admin.user_id (currently NOT NULL)...")
        with db.engine.connect() as conn:
            with conn.begin():
                conn.execute(text("""
                    CREATE TABLE _admin_new (
                        id INTEGER NOT NULL,
                        user_id INTEGER,
                        admin_username VARCHAR(255) NOT NULL UNIQUE,
                        admin_password VARCHAR(255) NOT NULL,
                        PRIMARY KEY (id)
                    )
                """))
                conn.execute(text(
                    "INSERT OR IGNORE INTO _admin_new SELECT * FROM admin"
                ))
                conn.execute(text("DROP TABLE admin"))
                conn.execute(text("ALTER TABLE _admin_new RENAME TO admin"))
        print("Done! admin.user_id is now nullable. You can register admins.")
    else:
        print("admin.user_id is already nullable — nothing to do.")
