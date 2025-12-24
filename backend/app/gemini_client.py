# # app/gemini_client.py

# import os
# import requests
# import json
# from dotenv import load_dotenv
# import urllib3
# urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
# load_dotenv()
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# GEMINI_URL = os.getenv("GEMINI_URL")


# def build_prompt(error_payload: dict) -> str:
#     """
#     בונה prompt עבור Gemini עם בקשה ל-return JSON במבנה המתאים ללקוח
#     """
#     return f"""
# You are a senior web debugging assistant.

# Analyze the following web error and return a JSON response with EXACTLY this structure:

# - summary (string)
# - instructions (array of step-by-step instructions)
# - changes (array of code changes; each with type, file, and code details)
# - confidence (float between 0 and 1)

# Error details:
# Error message: {error_payload.get("message")}
# File: {error_payload.get("file")}
# Line: {error_payload.get("line")}
# Code snippet: {error_payload.get("snippet")}
# Component Stack: {error_payload.get("componentStack")}

# Return ONLY valid JSON. No explanations. No markdown.
# """


# def analyze_error_with_gemini(error_payload: dict) -> dict:
#     # fallback אם אין מפתח API
#     if not GEMINI_API_KEY:
#         print("[INFO] No Gemini API key found, using fallback response.")
#         return {
#             "summary": "A JavaScript error occurred during render or execution.",
#             "instructions": [
#                 "Check where the error occurs and initialize variables properly.",
#                 "Wrap code in try/catch if needed.",
#                 "Ensure components receive valid props and state."
#             ],
#             "changes": [
#                 {
#                     "type": "replace",
#                     "file": error_payload.get("file", "unknown"),
#                     "startLine": error_payload.get("line", 0),
#                     "before": error_payload.get("snippet", ""),
#                     "after": "// TODO: fix this line"
#                 }
#             ],
#             "confidence": 0.7
#         }

#     prompt = build_prompt(error_payload)
#     headers = {"Content-Type": "application/json"}
#     body = {"contents": [{"parts": [{"text": prompt}]}]}

#     print(f"[INFO] Sending request to Gemini API: {GEMINI_URL}")
#     print(f"[DEBUG] Request body:\n{json.dumps(body, indent=2)}")

#     try:
#         response = requests.post(
#             f"{GEMINI_URL}?key={GEMINI_API_KEY}",
#             headers=headers,
#             json=body,
#             timeout=20,
#             verify=False
#         )
#         print(f"[INFO] Response status code: {response.status_code}")
#         response.raise_for_status()

#         result = response.json()
#         print(f"[DEBUG] Raw response JSON:\n{json.dumps(result, indent=2)}")

#         text = (
#             result["candidates"][0]
#             ["content"]["parts"][0]
#             ["text"]
#         )

#         if text.startswith("```json"):
#             text = text.replace("```json", "").replace("```", "").strip()

#         print(f"[DEBUG] Extracted text from Gemini:\n{text}")

#         parsed = json.loads(text)
#         print(f"[INFO] Parsed JSON from Gemini:\n{json.dumps(parsed, indent=2)}")

#         # החזרה במבנה שהלקוח מצפה לו
#         return parsed

#     except Exception as e:
#         print("[ERROR] Gemini API call failed:", e)
#         return {
#             "summary": "A JavaScript error occurred during render or execution.",
#             "instructions": [
#                 "Check where the error occurs and initialize variables properly.",
#                 "Wrap code in try/catch if needed.",
#                 "Ensure components receive valid props and state."
#             ],
#             "changes": [
#                 {
#                     "type": "replace",
#                     "file": error_payload.get("file", "unknown"),
#                     "startLine": error_payload.get("line", 0),
#                     "before": error_payload.get("snippet", ""),
#                     "after": "// TODO: fix this line"
#                 }
#             ],
#             "confidence": 0.7
#         }
# app/gemini_client.py

import os
import requests
import json
from dotenv import load_dotenv
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = os.getenv("GEMINI_URL")

def build_prompt(error_payload: dict) -> str:
    message = error_payload.get("message", "No message")
    file = error_payload.get("file", "Unknown file")
    line = error_payload.get("line", "Unknown line")
    snippet = error_payload.get("snippet", "No code snippet available")
    stack = error_payload.get("componentStack", "No stack trace")

    return f"""
You are a senior web debugging assistant. 
Analyze the error and return EXACTLY ONE JSON object.

### Constraints:
1. Return ONLY valid JSON (no markdown tags).
2. If the "Code Snippet" is missing or "None", return an empty array [] for the "changes" field. Do not guess the code.
3. In the "changes" array, provide ONLY the single most relevant fix.
4. Use "REPLACE", "ADD", or "DELETE" for the change type.


### Required JSON Structure:
{{
  "summary": "Short explanation of the root cause",
  "instructions": [
    "Step 1",
    "Step 2"
  ],
  "changes": [
    {{
      "type": "REPLACE",
      "file": "{file}",
      "line": {line if str(line).isdigit() else "null"},
      "before": "Original code line",
      "after": "Fixed code line"
    }}
  ],
  "confidence": 0.9
}}

### Error Context:
- Message: {message}
- Location: {file} at line {line}
- Code Snippet: 
{snippet}

- Component Stack: {stack}

Final instruction: If you cannot find a specific fix due to missing code context, focus the "summary" on diagnosis and keep "changes" as []. Return only JSON.
"""
# # def build_prompt(error_payload: dict) -> str:
#     """
#     בונה prompt עבור Gemini עם בקשה ל-return JSON במבנה המתאים ללקוח
#     """
#     return f"""
# You are a senior web debugging assistant.

# Analyze the following web error and return a JSON response with EXACTLY this structure:

# - summary (string)
# - instructions (array of step-by-step instructions)
# - changes (array of code changes; each with type, file, and code details)
# - confidence (float between 0 and 1)

# Error details:
# Error message: {error_payload.get("message")}
# File: {error_payload.get("file")}
# Line: {error_payload.get("line")}
# Code snippet: {error_payload.get("snippet")}
# Component Stack: {error_payload.get("componentStack")}

# Return ONLY valid JSON. No explanations. No markdown.
# """


def analyze_error_with_gemini(error_payload: dict) -> dict:
    # fallback אם אין מפתח API
    if not GEMINI_API_KEY:
        print("[INFO] No Gemini API key found, using fallback response.")
        return {
            "summary": "A JavaScript error occurred during render or execution.",
            "instructions": [
                "Check where the error occurs and initialize variables properly.",
                "Wrap code in try/catch if needed.",
                "Ensure components receive valid props and state."
            ],
            "changes": [
                {
                    "type": "replace",
                    "file": error_payload.get("file", "unknown"),
                    "startLine": error_payload.get("line", 0),
                    "before": error_payload.get("snippet", ""),
                    "after": "// TODO: fix this line"
                }
            ],
            "confidence": 0.7
        }

    prompt = build_prompt(error_payload)
    headers = {"Content-Type": "application/json"}
    body = {"contents": [{"parts": [{"text": prompt}]}]}

    print(f"[INFO] Sending request to Gemini API: {GEMINI_URL}")
    print(f"[DEBUG] Request body:\n{json.dumps(body, indent=2)}")

    try:
        response = requests.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=body,
            timeout=20,
            verify=False
        )
        print(f"[INFO] Response status code: {response.status_code}")
        response.raise_for_status()

        result = response.json()
        print(f"[DEBUG] Raw response JSON:\n{json.dumps(result, indent=2)}")

        text = (
            result["candidates"][0]
            ["content"]["parts"][0]
            ["text"]
        )

        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()

        print(f"[DEBUG] Extracted text from Gemini:\n{text}")

        parsed = json.loads(text)
        print(f"[INFO] Parsed JSON from Gemini:\n{json.dumps(parsed, indent=2)}")

        # החזרה במבנה שהלקוח מצפה לו
        return parsed

    except Exception as e:
        print("[ERROR] Gemini API call failed:", e)
        return {
            "summary": "A JavaScript error occurred during render or execution.",
            "instructions": [
                "Check where the error occurs and initialize variables properly.",
                "Wrap code in try/catch if needed.",
                "Ensure components receive valid props and state."
            ],
            "changes": [
                {
                    "type": "replace",
                    "file": error_payload.get("file", "unknown"),
                    "startLine": error_payload.get("line", 0),
                    "before": error_payload.get("snippet", ""),
                    "after": "// TODO: fix this line"
                }
            ],
            "confidence": 0.7
        }