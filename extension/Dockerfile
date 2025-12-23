# שלב 1: בניית הקוד
FROM node:20-alpine AS build-stage

WORKDIR /app

# הגדרות לעקיפת בעיות חיבור (מתאים לנטפרי/חסימות)
RUN npm config set strict-ssl false

# העתקת קבצי הגדרות
COPY package*.json ./

# התקנה עם דגל שמתעלם מבעיות תעודה
RUN npm install --no-audit --no-fund

# העתקת שאר הקוד ובנייה
COPY . .
RUN npm run build

# שלב 2: הגשת הקבצים
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]