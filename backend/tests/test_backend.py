import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app
from app.gemini_client import build_prompt

client = TestClient(app)

# --- Unit Test: בדיקת לוגיקה פנימית ---
def test_build_prompt_logic():
    """בודק שהפרומפט נבנה נכון עם נתוני השגיאה"""
    sample_payload = {"message": "ReferenceError", "file": "App.js", "line": 5}
    prompt = build_prompt(sample_payload)
    assert "ReferenceError" in prompt
    assert "App.js" in prompt
    assert "Line: 5" in prompt

# --- Integration Test: בדיקת ה-API מקצה לקצה ---
@patch("app.main.analyze_error_with_gemini")
def test_ingest_error_endpoint(mock_gemini):
    """בודק ששליחת שגיאה נשמרת ומקבלת ניתוח (עם Mock ל-API חיצוני)"""
    # הגדרת תשובה מזויפת מ-Gemini כדי לא להוציא כסף/קריאות אמיתיות
    mock_gemini.return_value = {
        "summary": "Detected a variable issue",
        "confidence": 0.95
    }
    
    test_data = {
        "source": "window.error",
        "kind": "runtime-error",
        "message": "Uncaught TypeError",
        "file": "main.js",
        "line": 12
    }
    
    response = client.post("/ingest-error", json=test_data)
    
    assert response.status_code == 200
    assert response.json()["received"] is True
    assert response.json()["analysis"]["summary"] == "Detected a variable issue"

# --- Unit Test: בדיקת תקינות השרת ---
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_list_errors():
    """בדיקה שמוודאת שניתן לשלוף את רשימת השגיאות מהמאגר"""
    response = client.get("/errors")
    assert response.status_code == 200
    assert "errors" in response.json()
    assert isinstance(response.json()["errors"], list)