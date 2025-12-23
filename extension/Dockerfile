 # שלב 1: בניית הקבצים (Build stage)
# FROM node:20-slim AS builder
# WORKDIR /app
# COPY . .
# # אם יש לך npm install/build, זה המקום. אם לא, פשוט ממשיכים.

# # שלב 2: הגשת הקבצים (Runtime stage)
# FROM nginx:alpine
# # מעתיקים את קבצי התוסף לתיקייה שהדוקר מגיש
# COPY --from=builder /app /usr/share/nginx/html
# EXPOSE 80
# שלב 1: בניית הקוד (Build Stage)
FROM node:20-alpine AS build-stage

WORKDIR /app

# העתקת קבצי הגדרות והתקנת חבילות
COPY package*.json ./
RUN npm install

# העתקת שאר קוד המקור ובניית התוסף
COPY . .
RUN npm run build

# שלב 2: הגשת הקבצים (Runtime stage)
FROM nginx:alpine

# העתקת הקבצים המוכנים בלבד (תיקיית dist) לתיקייה שה-Nginx מגיש
# שימי לב: אם בתוסף שלך תיקיית הפלט היא 'build' ולא 'dist', שמי לב לשנות את הנתיב למטה
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]