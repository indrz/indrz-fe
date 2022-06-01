FROM nginx:1.19

# Clean
RUN rm -fr /var/www/* /etc/nginx/conf.d/*
# Copy
COPY devops/docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY dist /var/www

