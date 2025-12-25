import os
import requests
import json
from dotenv import load_dotenv
import urllib3
import re
import time  

# ביטול אזהרות SSL וטעינת משתני סביבה
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = os.getenv("GEMINI_URL")


def build_prompt(error_payload: dict) -> str:
    """
    בונה prompt עבור Gemini עם בקשה ל-return JSON במבנה המתאים ללקוח
    """
    return f"""
You are a senior web debugging assistant.

Analyze the following web error and return a JSON response with EXACTLY this structure:

- summary (string)
- instructions (array of step-by-step instructions)
- changes (array of code changes; each with type, file, and code details)
- confidence (float between 0 and 1)

Error details:
Error message: {error_payload.get("message")}
File: {error_payload.get("file")}
Line: {error_payload.get("line")}
Code snippet: {error_payload.get("snippet")}
Component Stack: {error_payload.get("componentStack")}

Return ONLY valid JSON. No explanations. No markdown.
"""

def analyze_error_with_gemini(error_payload: dict) -> dict:
    """
    ניתוח ראשוני של השגיאה (בלחיצה על Solve)
    """
    print(f"\n[LOG] Starting analysis for error: {error_payload.get('message')}")
    
    if not GEMINI_API_KEY:
        print("[LOG] ERROR: No Gemini API key found.")
        return {"summary": "API Key missing", "instructions": ["Add key to .env"], "changes": []}

    prompt = build_prompt(error_payload)
    headers = {"Content-Type": "application/json"}
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"response_mime_type": "application/json"}
    }

    try:
        print(f"[LOG] Sending request to Gemini API...")
        response = requests.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}", headers=headers, json=body, timeout=20, verify=False)
        response.raise_for_status()
        
        result = response.json()
        raw_text = result["candidates"][0]["content"]["parts"][0]["text"]
        
        # ניקוי Markdown במידה והמודל הוסיף
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()
        
        print(f"[LOG] Raw AI response received: {raw_text[:100]}...") # לוג חלקי של התשובה
        
        parsed = json.loads(raw_text)
        
        if parsed.get("type") == "file_request":
            print(f"[LOG] AI requested files: {parsed.get('files')}")
        else:
            print("[LOG] AI provided a potential solution.")
            
        return parsed

    except Exception as e:
        print(f"[LOG] EXCEPTION in analyze_error: {str(e)}")
        return {"summary": "Failed to analyze", "instructions": [str(e)], "changes": []}
    #תיקון שעוזר ליעל את ההסטוריה וה
# def chat_with_gemini(error_context: dict, history: list, file_contents: dict = None):
#     """
#     מנהל שיחת צ'אט עם הגנות Rate-Limit וניקוי קוד מקומפל
#     """
#     import re # ודאי שיש import re בתחילת הקובץ
    
#     # --- הגנה: צמצום היסטוריה כדי למנוע 429 (Rate Limit) ---
#     # שומרים רק את ה-6 הודעות האחרונות כדי לא לחרוג ממכסת ה-Tokens
#     if len(history) > 6:
#         history = history[-6:]
    
#     print(f"\n[LOG] Continuing chat. History length: {len(history)}")
    
#     # 1. הכנת תוכן הקבצים (Context) עם ניקוי רעשים
#     extra_context = ""
#     if file_contents:
#         extra_context = "\n\n### ATTACHED SOURCE CODE (Cleaned):\n"
#         for name, content in file_contents.items():
#             # ניקוי בסיסי של רעשי Vite כדי לחסוך ב-Tokens ולמנוע מה-AI להתבלבל
#             clean_content = re.sub(r'if\s*\(import\.meta\.hot\)\s*\{[\s\S]*?\}', '', content)
#             clean_content = re.sub(r'__vite__\w+', '', clean_content)
#             extra_context += f"--- File: {name} ---\n{clean_content}\n"

#     # 2. בניית מערך ההודעות מההיסטוריה
#     contents = []
#     for msg in history:
#         role = "user" if msg.role == "user" else "model"
#         contents.append({"role": role, "parts": [{"text": msg.content}]})

#     # 3. הזרקת הקוד להודעה האחרונה
#     if extra_context:
#         if contents and contents[-1]["role"] == "user":
#             contents[-1]["parts"][0]["text"] += extra_context
#         else:
#             contents.append({"role": "user", "parts": [{"text": f"[System: Source Code Context]{extra_context}"}]})

#     # 4. הנחיות מערכת משופרות (הוספתי הנחיית ניקוי ל-Vite)
#     system_instruction = f"""
# ROLE: Senior Full-Stack Debugging Expert.
# Return ONLY valid JSON. No explanations. No markdown.

# ### VITE/COMPILATION RULE:
# The code provided may contain Vite wrappers or HMR artifacts. 
# YOU MUST:
# 1. Extract the original React logic.
# 2. In the "before" and "after" fields, provide CLEAN code as it appears in the user's VSCode, NOT the compiled version.

# ### MANDATORY JSON FORMAT:
# You must choose EXACTLY one of these two formats:

# 1. IF YOU NEED TO SEE SOURCE CODE:
# {{
#   "type": "file_request",
#   "files": ["App.jsx"], 
#   "text": "Detailed reason why this file is required."
# }}

# 2. IF YOU ARE PROVIDING A FIX OR ANSWERING A QUESTION:
# {{
#   "type": "message",
#   "text": "Your verbal explanation to the user here.",
#   "changes": [
#     {{
#       "file": "{error_context.get('file', 'App.jsx').split('/')[-1]}",
#       "before": "EXACT original line(s) to be replaced",
#       "after": "EXACT new line(s) to insert"
#     }}
#   ]
# }}

# ### CRITICAL CONSTRAINTS:
# - CURRENT ERROR: "{error_context.get('message')}" in {error_context.get('file')}.
# - Return ONLY the JSON object. No extra text.
# """
    
#     payload = {
#         "contents": contents,
#         "system_instruction": {"parts": [{"text": system_instruction}]},
#         "generationConfig": {
#             "response_mime_type": "application/json",
#             "temperature": 0.1 # טמפרטורה נמוכה הופכת את ה-JSON ליותר יציב
#         }
#     }

#     # 5. שליחה עם מנגנון Retry
#     raw_text = ""
#     for attempt in range(3):
#         try:
#             print(f"[LOG] Sending chat payload (Attempt {attempt+1})...")
#             response = requests.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}", json=payload, verify=False, timeout=30)
            
#             if response.status_code == 429:
#                 wait_time = (attempt + 1) * 5 # המתנה ארוכה יותר ב-429
#                 print(f"[LOG] Rate limit hit, retrying in {wait_time}s...")
#                 time.sleep(wait_time)
#                 continue
                
#             response.raise_for_status()
#             res_json = response.json()
            
#             if 'candidates' in res_json and res_json['candidates'][0]['content']['parts']:
#                 raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
#                 break
#             else:
#                 raise Exception("Empty response from Gemini")

#         except Exception as e:
#             if attempt == 2:
#                 print(f"[LOG] Final attempt failed: {str(e)}")
#                 return {"type": "message", "text": "The AI is currently overloaded. Please wait 10 seconds and try again."}
#             time.sleep(2)

#     # 6. חילוץ ופענוח ה-JSON
#     try:
#         if not raw_text:
#             raise ValueError("No text returned from API")
            
#         # ניקוי שאריות Markdown
#         raw_text = re.sub(r'```json\s*|\s*```', '', raw_text).strip()
        
#         match = re.search(r'\{.*\}', raw_text, re.DOTALL)
#         clean_json = match.group(0) if match else raw_text

#         print(f"[LOG] Chat response parsed successfully.")
#         return json.loads(clean_json)

#     except Exception as e:
#         print(f"[LOG] Failed to parse JSON. Error: {str(e)}")
#         print(f"[DEBUG] Raw response was: {raw_text}")
#         return {"type": "message", "text": "I had trouble formatting the fix. Please try again."}
def chat_with_gemini(error_context: dict, history: list, file_contents: dict = None):
    """
    מנהל שיחת צ'אט (המשך דיאלוג)
    """
    print(f"\n[LOG] Continuing chat. History length: {len(history)}")
    
    # 1. הכנת תוכן הקבצים (Context)
    extra_context = ""
    if file_contents:
        extra_context = "\n\n### ATTACHED SOURCE CODE (Use this to fix the bug):\n"
        for name, content in file_contents.items():
            extra_context += f"--- File: {name} ---\n{content}\n"

    # 2. בניית מערך ההודעות מההיסטוריה
    contents = []
    for msg in history:
        role = "user" if msg.role == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg.content}]})

    # 3. הזרקת הקוד - קריטי! 
    # אנחנו מדביקים את הקוד להודעה האחרונה שהמשתמש שלח (או יוצרים הודעה חדשה אם ההיסטוריה ריקה)
    if extra_context:
        if contents and contents[-1]["role"] == "user":
            contents[-1]["parts"][0]["text"] += extra_context
        else:
            contents.append({"role": "user", "parts": [{"text": f"[System: Code provided]{extra_context}"}]})

    # 4. הנחיות מערכת
    system_instruction = f"""
ROLE: Senior Full-Stack Debugging Expert.
Return ONLY valid JSON. No explanations. No markdown.

### MANDATORY JSON FORMAT:
You must choose EXACTLY one of these two formats:

1. IF YOU NEED TO SEE SOURCE CODE:
{{
  "type": "file_request",
  "files": ["App.jsx"], 
  "text": "Detailed reason why this file is required."
}}
* Note: In "files", provide ONLY the filename (e.g., 'App.jsx') or the relative path from the stack trace. NEVER include full URLs or protocols.

2. IF YOU ARE PROVIDING A FIX OR ANSWERING A QUESTION:
{{
  "type": "message",
  "text": "Your verbal explanation to the user here.",
  "changes": [
    {{
      "file": "App.jsx",
      "before": "EXACT original line(s) to be replaced",
      "after": "EXACT new line(s) to insert"
    }}
  ]
}}

### CRITICAL CONSTRAINTS - DO NOT VIOLATE:
- NEVER use keys like "old_content", "new_content", "original", or "fixed".
- Use ONLY "before" and "after" inside the "changes" array.
- The "changes" array is OPTIONAL. If no code change is needed, return "changes": [].
- If the user provides code in the chat, use it to fill the "before" and "after" fields.
- CURRENT ERROR CONTEXT: Error "{error_context.get('message')}" in {error_context.get('file')}.
STRICT RULE: You are a headless API. 
NEVER include any text, notes, or explanations outside the JSON object.
If you talk, the system crashes. Return ONLY the JSON.
"""
    payload = {
        "contents": contents,
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": {"response_mime_type": "application/json"}
    }

    # 5. שליחה עם מנגנון Retry לטיפול ב-429 ושגיאות רשת
    raw_text = ""
    for attempt in range(3):
        try:
            print(f"[LOG] Sending chat payload (Attempt {attempt+1})...")
            response = requests.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}", json=payload, verify=False, timeout=30)
            
            if response.status_code == 429:
                print(f"[LOG] Rate limit hit, retrying in {attempt + 2}s...")
                time.sleep(attempt + 2)
                continue
                
            response.raise_for_status()
            res_json = response.json()
            raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
            break # הצלחנו, יוצאים מהלולאה
        except Exception as e:
            if attempt == 2: # ניסיון אחרון נכשל
                print(f"[LOG] Final attempt failed: {str(e)}")
                return {"type": "message", "text": "I'm having technical difficulties. Please try again."}
            time.sleep(1)

    # 6. חילוץ ופענוח ה-JSON (הפתרון לשגיאת Extra Data)
    try:
        # ניקוי Markdown בסיסי
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        # שימוש ב-Regex לחילוץ האובייקט בלבד - מטפל ב-Extra Data
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            clean_json = match.group(0)
        else:
            clean_json = raw_text

        print(f"[LOG] Chat response parsed successfully.")
        return json.loads(clean_json)

    except Exception as e:
        print(f"[LOG] Failed to parse JSON. Error: {str(e)}")
        print(f"[DEBUG] Raw response was: {raw_text}")
        return {"type": "message", "text": "I encountered a formatting error. Can you try rephrasing?"}
    system_instruction = f"""
You are a senior web debugging assistant.
Current Context: Error "{error_context.get('message')}" in {error_context.get('file')}.

### YOUR TASK:
Provide a precise solution. Analyze the attached source code if provided.

### RESPONSE FORMAT RULES:
You must respond with EXACTLY ONE of these JSON formats:
1. IF YOU NEED MORE CODE: {{"type": "file_request", "files": ["filename.js"], "text": "..."}}
2. IF YOU HAVE THE FIX: {{"type": "message", "text": "...", "changes": [...]}}

### CRITICAL:
- Do not include any text outside the JSON.
"""

    payload = {
        "contents": contents,
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": {"response_mime_type": "application/json"}
    }

    try:
        print("[LOG] Sending chat payload to Gemini...")

        response = requests.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}", json=payload, verify=False)
        
        response.raise_for_status()
        
        res_json = response.json()

        raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
        
        
        # ניקוי Markdown ליתר ביטחון
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()
            
        print(f"[LOG] Chat response received.")
        return json.loads(raw_text)
    except Exception as e:
        print(f"[LOG] EXCEPTION in chat_with_gemini: {str(e)}")
        return {"type": "message", "text": "I encountered a technical error."}
# # import os
# # import requests
# # import json
# # from dotenv import load_dotenv
# # import urllib3
# # urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
# # load_dotenv()
# # GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# # GEMINI_URL = os.getenv("GEMINI_URL")


# # def build_prompt(error_payload: dict) -> str:
# #     """
# #     בונה prompt עבור Gemini עם בקשה ל-return JSON במבנה המתאים ללקוח
# #     """
# #     return f"""
# # You are a senior web debugging assistant.

# # Analyze the following web error and return a JSON response with EXACTLY this structure:

# # - summary (string)
# # - instructions (array of step-by-step instructions)
# # - changes (array of code changes; each with type, file, and code details)
# # - confidence (float between 0 and 1)

# # Error details:
# # Error message: {error_payload.get("message")}
# # File: {error_payload.get("file")}
# # Line: {error_payload.get("line")}
# # Code snippet: {error_payload.get("snippet")}
# # Component Stack: {error_payload.get("componentStack")}

# # Return ONLY valid JSON. No explanations. No markdown.
# # """


# # def analyze_error_with_gemini(error_payload: dict) -> dict:
# #     # fallback אם אין מפתח API
# #     if not GEMINI_API_KEY:
# #         print("[INFO] No Gemini API key found, using fallback response.")
# #         return {
# #             "summary": "A JavaScript error occurred during render or execution.",
# #             "instructions": [
# #                 "Check where the error occurs and initialize variables properly.",
# #                 "Wrap code in try/catch if needed.",
# #                 "Ensure components receive valid props and state."
# #             ],
# #             "changes": [
# #                 {
# #                     "type": "replace",
# #                     "file": error_payload.get("file", "unknown"),
# #                     "startLine": error_payload.get("line", 0),
# #                     "before": error_payload.get("snippet", ""),
# #                     "after": "// TODO: fix this line"
# #                 }
# #             ],
# #             "confidence": 0.7
# #         }

# #     prompt = build_prompt(error_payload)
# #     headers = {"Content-Type": "application/json"}
# #     body = {"contents": [{"parts": [{"text": prompt}]}]}

# #     print(f"[INFO] Sending request to Gemini API: {GEMINI_URL}")
# #     print(f"[DEBUG] Request body:\n{json.dumps(body, indent=2)}")

# #     try:
# #         response = requests.post(
# #             f"{GEMINI_URL}?key={GEMINI_API_KEY}",
# #             headers=headers,
# #             json=body,
# #             timeout=20,
# #             verify=False
# #         )
# #         print(f"[INFO] Response status code: {response.status_code}")
# #         response.raise_for_status()

# #         result = response.json()
# #         print(f"[DEBUG] Raw response JSON:\n{json.dumps(result, indent=2)}")

# #         text = (
# #             result["candidates"][0]
# #             ["content"]["parts"][0]
# #             ["text"]
# #         )

# #         if text.startswith("```json"):
# #             text = text.replace("```json", "").replace("```", "").strip()

# #         print(f"[DEBUG] Extracted text from Gemini:\n{text}")

# #         parsed = json.loads(text)
# #         print(f"[INFO] Parsed JSON from Gemini:\n{json.dumps(parsed, indent=2)}")

# #         # החזרה במבנה שהלקוח מצפה לו
# #         return parsed

# #     except Exception as e:
# #         print("[ERROR] Gemini API call failed:", e)
# #         return {
# #             "summary": "A JavaScript error occurred during render or execution.",
# #             "instructions": [
# #                 "Check where the error occurs and initialize variables properly.",
# #                 "Wrap code in try/catch if needed.",
# #                 "Ensure components receive valid props and state."
# #             ],
# #             "changes": [
# #                 {
# #                     "type": "replace",
# #                     "file": error_payload.get("file", "unknown"),
# #                     "startLine": error_payload.get("line", 0),
# #                     "before": error_payload.get("snippet", ""),
# #                     "after": "// TODO: fix this line"
# #                 }
# #             ],
# #             "confidence": 0.7
# #         }
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
# # app/gemini_client.py
# import os
# import requests
# import json
# def chat_with_gemini(error_context: dict, history: list, file_contents: dict = None):
#     """
#     מנהל שיחת צ'אט עם Gemini על שגיאה ספציפית ומבקש קבצים במידת הצורך
#     """
    
#     # בניית רשימת הקבצים שכבר קיימים כדי שה-AI לא יבקש אותם שוב
#     files_already_have = list(file_contents.keys()) if file_contents else []

#     system_instruction = f"""
#     You are a professional full-stack debugging assistant. 
#     The user is asking questions about this error: "{error_context.get('message')}" 
#     Location: "{error_context.get('file')}" at line {error_context.get('line')}.

#     CONTEXT:
#     - Stack Trace: {error_context.get('stack')}
#     - Current Snippet: {error_context.get('snippet')}
    
#     SOURCE CODE ALREADY ACCESSIBLE:
#     {json.dumps(file_contents) if file_contents else "None yet."}

#     CRITICAL INSTRUCTIONS:
#     1. PROACTIVE DEBUGGING: If the current snippet is too short or doesn't show the root cause, you MUST request the full file or related files.
#     2. CHECK THE STACK: Look at the stack trace. If you see logic in other files (e.g., hooks, utils, components) that might be involved, ask for them.
#     3. RESPONSE FORMAT: You MUST return a VALID JSON object.
    
#     FORMAT A (Regular Message):
#     {{
#       "type": "message", 
#       "text": "Your helpful explanation and fix here..."
#     }}

#     FORMAT B (File Request - Use if you need more code):
#     {{
#       "type": "file_request", 
#       "files": ["filename.js"],
#       "text": "I need to see the logic in 'filename.js' to provide a correct fix."
#     }}

#     Already provided files: {files_already_have}. Do not request these again unless you need a different part of the file.
#     """

#     contents = []
#     for msg in history:
#         role = "user" if msg.role == "user" else "model"
#         contents.append({"role": role, "parts": [{"text": msg.content}]})

#     payload = {
#         "contents": contents,
#         "system_instruction": {"parts": [{"text": system_instruction}]},
#         "generationConfig": {
#             "response_mime_type": "application/json",
#         }
#     }

#     try:
#         response = requests.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}", json=payload, verify=False)
#         response.raise_for_status()
#         res_json = response.json()
        
#         raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
#         return json.loads(raw_text)
#     except Exception as e:
#         print(f"Error in Gemini Chat: {e}")
#         return {"type": "message", "text": "I encountered an error while processing your request."}
    
# # ... (הקוד הקיים שלך נשאר) ...

# # def chat_with_gemini(error_context: dict, history: list, file_contents: dict = None):
# #     """
# #     מנהל שיחת צאט עם Gemini על שגיאה ספציפית
# #     """
# #     # 1. בניית ה-System Prompt שמגדיר ל-AI איך להתנהג
# #     system_instruction = f"""
# #     You are a professional full-stack debugging assistant. 
# #     The user is asking questions about a specific error: "{error_context.get('message')}" 
# #     that occurred in file: "{error_context.get('file')}" at line {error_context.get('line')}.

# #     CONTEXT:
# #     - Stack Trace: {error_context.get('stack')}
# #     - Code Snippet: {error_context.get('snippet')}
    
# #     FILES PROVIDED SO FAR:
# #     {json.dumps(file_contents) if file_contents else "No files provided yet."}

# #     GUIDELINES:
# #     1. If you can solve the issue with the current info, provide a clear explanation and code fix.
# #     2. If you need to see the source code of specific files to be sure, you MUST ask for them.
# #     3. YOUR RESPONSE MUST BE A VALID JSON with this structure:
# #        {{
# #          "type": "message", 
# #          "text": "Your response to the user..."
# #        }}
# #        OR (if you need files):
# #        {{
# #          "type": "file_request", 
# #          "files": ["filename1.js", "filename2.css"],
# #          "text": "I need to see these files to help you better..."
# #        }}
# #     """

# #     # 2. הכנת ה-Payload ל-Gemini API
# #     # אנחנו הופכים את ה-history למבנה ש-Gemini מבין
# #     contents = []
# #     for msg in history:
# #         role = "user" if msg.role == "user" else "model"
# #         contents.append({"role": role, "parts": [{"text": msg.content}]})

# #     # הוספת הוראת המערכת כהודעה ראשונה "סמויה" או כ-system_instruction (תלוי בגרסת המודל)
# #     # כאן נשתמש בגישה הפשוטה של להוסיף את זה לקונטקסט
# #     payload = {
# #         "contents": contents,
# #         "system_instruction": {"parts": [{"text": system_instruction}]},
# #         "generationConfig": {
# #             "response_mime_type": "application/json",
# #         }
# #     }

# #     try:
# #         response = requests.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}", json=payload, verify=False)
# #         response.raise_for_status()
# #         res_json = response.json()
        
# #         # חילוץ הטקסט והפיכתו ל-JSON
# #         raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
# #         return json.loads(raw_text)
# #     except Exception as e:
# #         print(f"Error in Gemini Chat: {e}")
# #         return {"type": "message", "text": "Sorry, I had a technical glitch. Try again?"}
    
# # def build_prompt(error_payload: dict) -> str:
# #     message = error_payload.get("message", "No message")
# #     file = error_payload.get("file", "Unknown file")
# #     line = error_payload.get("line", "Unknown line")
# #     snippet = error_payload.get("snippet", "No code snippet available")
# #     stack = error_payload.get("componentStack", "No stack trace")

# #     return f"""
# # You are a senior web debugging assistant. 
# # Analyze the error and return EXACTLY ONE JSON object.

# # ### Constraints:
# # 1. Return ONLY valid JSON (no markdown tags).
# # 2. If the "Code Snippet" is missing or "None", return an empty array [] for the "changes" field. Do not guess the code.
# # 3. In the "changes" array, provide ONLY the single most relevant fix.
# # 4. Use "REPLACE", "ADD", or "DELETE" for the change type.


# # ### Required JSON Structure:
# # {{
# #   "summary": "Short explanation of the root cause",
# #   "instructions": [
# #     "Step 1",
# #     "Step 2"
# #   ],
# #   "changes": [
# #     {{
# #       "type": "REPLACE",
# #       "file": "{file}",
# #       "line": {line if str(line).isdigit() else "null"},
# #       "before": "Original code line",
# #       "after": "Fixed code line"
# #     }}
# #   ],
# #   "confidence": 0.9
# # }}

# # ### Error Context:
# # - Message: {message}
# # - Location: {file} at line {line}
# # - Code Snippet: 
# # {snippet}

# # - Component Stack: {stack}

# # Final instruction: If you cannot find a specific fix due to missing code context, focus the "summary" on diagnosis and keep "changes" as []. Return only JSON.
# # """
# def build_prompt(error_payload: dict) -> str:
#     """
#     הפרומפט לניתוח הראשוני - שופץ כדי לעודד דיוק
#     """
#     message = error_payload.get("message", "No message")
#     file = error_payload.get("file", "Unknown file")
#     line = error_payload.get("line", "Unknown line")
#     snippet = error_payload.get("snippet", "")
#     stack = error_payload.get("componentStack", "No stack trace")

#     return f"""
# You are a senior web debugging assistant. 
# Analyze the error and return EXACTLY ONE JSON object.

# ### Strategy:
# - If the "Code Snippet" is empty or insufficient, set "changes" to [] and in "summary" explain that more context is needed. 
# - Focus on the most likely cause.

# ### Required JSON Structure:
# {{
#   "summary": "Root cause analysis",
#   "instructions": ["Step 1", "Step 2"],
#   "changes": [
#     {{
#       "type": "REPLACE",
#       "file": "{file}",
#       "line": {line if str(line).isdigit() else "null"},
#       "before": "...",
#       "after": "..."
#     }}
#   ],
#   "confidence": 0.9
# }}

# Error Context:
# - Message: {message}
# - File: {file}:{line}
# - Snippet: {snippet}
# - Stack: {stack}
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