from fastapi import FastAPI
from app.models import ErrorPayload
from app.store import save_error, get_all_errors
from app.gemini_client import analyze_error_with_gemini

app = FastAPI(title="AI Debug Assistant Backend")



@app.get("/health")
def health():
    return {"status": "ok"}



@app.post("/ingest-error")
def ingest_error(payload: ErrorPayload):
    # המרה ל-dict
    error_data = payload.model_dump()
    # שמירה ב-DB
    save_error(error_data)

    # ניתוח עם Gemini (כרגע mock)
    analysis = analyze_error_with_gemini(error_data)

    return {
        "received": True,
        "message": payload.message,
        "analysis": analysis
    }


@app.get("/errors")
def list_errors():
    return {
        "count": len(get_all_errors()),
        "errors": get_all_errors()
    }
