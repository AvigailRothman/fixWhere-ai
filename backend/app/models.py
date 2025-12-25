from pydantic import BaseModel
from typing import Optional

class ErrorPayload(BaseModel):
    source: str
    kind: str
    message: str
    stack: Optional[str] = None
    componentStack: Optional[str] = None
    file: Optional[str] = None
    line: Optional[int] = None
    column: Optional[int] = None
    snippet: Optional[str] = None
    pageHtml: Optional[str] = None
    fileContent: Optional[str] = None
    url: Optional[str] = None
    timestamp: Optional[int] = None
    # models.py
from pydantic import BaseModel
from typing import List, Optional, Dict

class ChatMessage(BaseModel):
    role: str      # "user" או "assistant"
    content: str

class ChatRequest(BaseModel):
    error_id: int              # ה-ID של השגיאה מה-DB
    history: List[ChatMessage] # כל היסטוריית השיחה עד כה
    files: Optional[Dict[str, str]] = None # קוד מקור אם חולץ
