FROM nginx:alpine

# מעתיק את כל קבצי ה-JS וה-Manifest מהתיקייה הנוכחית לשרת
COPY . /usr/share/nginx/html

# הסרת ה-Dockerfile עצמו מהשרת (אופציונלי, לניקיון)
RUN rm /usr/share/nginx/html/Dockerfile

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]