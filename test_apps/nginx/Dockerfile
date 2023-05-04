FROM nginx:alpine

WORKDIR /var/www/html

COPY ./static .

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/
