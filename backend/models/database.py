import sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATABASE_PATH = PROJECT_ROOT / "data" / "threat_intelligence.db"


def get_connection():
    """Create a connection to the SQLite database."""
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    """Create the table if it does not already exist."""
    connection = get_connection()

    try:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS threat_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                record_id INTEGER UNIQUE,
                ioc_type TEXT NOT NULL,
                ioc_value TEXT NOT NULL,
                category TEXT,
                severity TEXT,
                confidence INTEGER,
                risk_score INTEGER,
                risk_level TEXT,
                data_label TEXT NOT NULL
            )
        """)
        connection.commit()
        print("Database initialized successfully.")
        print("Label: SYNTHETIC/DEMO ONLY")
    finally:
        connection.close()


if __name__ == "__main__":
    initialize_database()