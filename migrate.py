"""
Run this to apply database migrations:
    python migrate.py

Migrations applied:
  1. admin.user_id made nullable (standalone admin accounts)
  2. report.reason column added
"""
from app import app
from sqlalchemy import text, inspect as sa_inspect

with app.app_context():
    from models import db

    inspector = sa_inspect(db.engine)

    # --- Migration 1: admin.user_id nullable ---
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
        print("Done! admin.user_id is now nullable.")
    else:
        print("[1] admin.user_id already nullable — skipped.")

    # --- Migration 2: report.reason column ---
    report_cols = [c['name'] for c in inspector.get_columns('report')]
    if 'reason' not in report_cols:
        print("Adding report.reason column...")
        with db.engine.connect() as conn:
            with conn.begin():
                conn.execute(text(
                    "ALTER TABLE report ADD COLUMN reason VARCHAR(255)"
                ))
        print("Done! report.reason column added.")
    else:
        print("[2] report.reason already exists — skipped.")
