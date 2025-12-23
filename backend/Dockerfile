FROM python:3.11-slim



# 1. התקנת תעודות SSL וכלי בסיס
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        build-essential \
        libssl-dev \
        libffi-dev \
        python3-dev && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*
COPY netfree-root.crt /usr/local/share/ca-certificates/netfree-root.crt
RUN update-ca-certificates
# 2. הגדרת תיקיית עבודה
WORKDIR /app

# 3. העתקת קובץ requirements
COPY requirements.txt .

# 4. עדכון pip והתקנת חבילות עם פתרון SSL
RUN python -m pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org

# 5. העתקת קוד האפליקציה
COPY app ./app

# 6. הגדרת הפקודה להרצה
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4000"]
