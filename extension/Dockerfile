# שלב 1: בניית הקבצים
FROM node:20-alpine AS build-stage
WORKDIR /app

# ביטול בדיקת SSL עבור npm (פותר שגיאה 254)
RUN npm config set strict-ssl false

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# שלב 2: הגשת הקבצים
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]