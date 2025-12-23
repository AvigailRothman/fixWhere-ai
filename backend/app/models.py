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
