from fastapi import FastAPI
from app.models import ErrorPayload
from app.store import save_error, get_all_errors
from app.gemini_client import analyze_error_with_gemini, chat_with_gemini
from app.models import ChatRequest, ChatMessage

app = FastAPI(title="AI Debug Assistant Backend")



@app.get("/health")
def health():
    return {"status": "ok"}



@app.post("/ingest-error")
def ingest_error(payload: ErrorPayload):
    # המרה ל-dict
    error_data = payload.model_dump()
    # שמירה ב-DB
    error_id=save_error(error_data)
   
    # ניתוח עם Gemini (כרגע mock)
    analysis = analyze_error_with_gemini(error_data)

    return {
        "received": True,
        "message": payload.message,
        "id": error_id, 
        "analysis": analysis
    }


@app.get("/errors")
def list_errors():
    return {
        "count": len(get_all_errors()),
        "errors": get_all_errors()
    }
# main.py

# וודאי שיש לך גישה ל-get_all_errors מתוך store.py
# app/main.py


# app/main.py

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    # 1. שליפת השגיאה מה-DB כדי שיהיה ל-AI את כל הנתונים המקוריים
    all_errors = get_all_errors()
    error_data = next((e for e in all_errors if e['id'] == request.error_id), None)
    # בתוך main.py

    if not error_data:
        return {"type": "message", "text": "אופס, לא מצאתי את השגיאה הזו במערכת."}

    # 2. קריאה למוח של ה-AI
    ai_response = chat_with_gemini(
        error_context=error_data,
        history=request.history,
        file_contents=request.files
    )

    return ai_response