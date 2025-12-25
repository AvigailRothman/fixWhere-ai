# app/store.py
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "errors.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS errors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT,
            kind TEXT,
            message TEXT,
            stack TEXT,
            componentStack TEXT,
            file TEXT,
            line INTEGER,
            column INTEGER,
            snippet TEXT,
            pageHtml TEXT,
            fileContent TEXT,
            url TEXT,
            timestamp INTEGER
        )
    """)
    conn.commit()
    conn.close()

def save_error(payload: dict) -> int: # <--- הוספנו -> int כדי להבהיר שזה תמיד מספר
    conn = sqlite3.connect(DB_PATH)
   
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO errors (
            source, kind, message, stack, componentStack,
            file, line, column, snippet, pageHtml, fileContent, url, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        payload.get("source"),
        payload.get("kind"),
        payload.get("message"),
        payload.get("stack"),
        payload.get("componentStack"),
        payload.get("file"),
        payload.get("line"),
        payload.get("column"),
        payload.get("snippet"),
        payload.get("pageHtml"),
        payload.get("fileContent"),
        payload.get("url"),
        payload.get("timestamp")
    ))                                          
    last_id = cursor.lastrowid # <--- שורה חדשה: מקבל את ה-ID שנוצר הרגע
    conn.commit()
    conn.close()
    return last_id
# app/store.py



def get_all_errors():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM errors ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(zip([
        "id","source","kind","message","stack","componentStack",
        "file","line","column","snippet","pageHtml","fileContent","url","timestamp"
    ], row)) for row in rows]

# קריאה לאתחול DB כשמטעינים את store
init_db()
