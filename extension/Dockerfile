# שלב 1: בניית הקבצים (Build stage)
FROM node:20-slim AS builder
WORKDIR /app
COPY . .
# אם יש לך npm install/build, זה המקום. אם לא, פשוט ממשיכים.

# שלב 2: הגשת הקבצים (Runtime stage)
FROM nginx:alpine
# מעתיקים את קבצי התוסף לתיקייה שהדוקר מגיש
COPY --from=builder /app /usr/share/nginx/html
EXPOSE 80