# שלב 1: בניית הקבצים
FROM node:20-alpine AS build-stage
WORKDIR /app

# פתרון קריטי לשגיאה 254: ביטול בדיקת תעודות SSL ב-npm ובסביבה
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npm config set strict-ssl false
RUN npm config set registry http://registry.npmjs.org/

# העתקת קבצים
COPY package*.json ./

# התקנה עם דגלים שמונעים עצירה על שגיאות רשת קטנות
RUN npm install --no-audit --no-fund --legacy-peer-deps || npm install --no-audit --no-fund --legacy-peer-deps

COPY . .
RUN npm run build

# שלב 2: הגשת הקבצים (Nginx)
FROM nginx:alpine
# מוודא שתיקיית dist קיימת. אם אצלך זה 'build', שנה את הנתיב למטה
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]