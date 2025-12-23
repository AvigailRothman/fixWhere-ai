# FROM python:3.11-slim



# # 1. התקנת תעודות SSL וכלי בסיס
# RUN apt-get update && \
#     apt-get install -y --no-install-recommends \
#         ca-certificates \
#         curl \
#         build-essential \
#         libssl-dev \
#         libffi-dev \
#         python3-dev && \
#     update-ca-certificates && \
#     rm -rf /var/lib/apt/lists/*
# COPY netfree-root.crt /usr/local/share/ca-certificates/netfree-root.crt
# RUN update-ca-certificates
# # 2. הגדרת תיקיית עבודה
# WORKDIR /app

# # 3. העתקת קובץ requirements
# COPY requirements.txt .

# # 4. עדכון pip והתקנת חבילות עם פתרון SSL
# RUN python -m pip install --upgrade pip setuptools wheel
# RUN pip install --no-cache-dir -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org

# # 5. העתקת קוד האפליקציה
# COPY app ./app

# # 6. הגדרת הפקודה להרצה
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4000"]
# שלב 1: שלב הבנייה (Builder)
FROM python:3.11-slim AS builder

# הגדרת משתני סביבה למניעת קבצי זבל של פייתון
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# התקנת כלי בנייה זמניים
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libssl-dev \
        libffi-dev && \
    rm -rf /var/lib/apt/lists/*

# שדרוג pip והתקנת חבילות לתוך תיקייה ייעודית
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --user --no-cache-dir -r requirements.txt \
        --trusted-host pypi.org \
        --trusted-host files.pythonhosted.org

# שלב 2: האימג' הסופי והרזה (Runner)
FROM python:3.11-slim

WORKDIR /app

# העתקת תעודת נטפרי ועדכון (רק מה שחובה להרצה)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY netfree-root.crt /usr/local/share/ca-certificates/netfree-root.crt
RUN update-ca-certificates

# העתקת הספריות המותקנות בלבד משלב הבנייה (חוסך המון מקום)
COPY --from=builder /root/.local /root/.local
COPY app ./app

# הוספת הנתיב של הספריות המקומיות ל-PATH
ENV PATH=/root/.local/bin:$PATH

# חשיפת הפורט והרצה
EXPOSE 4000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4000"]