# Dockerfile פשוט - לא מבצע התקנות, רק מגיש קבצים
FROM nginx:alpine

# מעתיק את תיקיית ה-dist שנבנתה מחוץ לדוקר
COPY ./dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]