FROM node:18.12.1-alpine as build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

# Set the NODE_OPTIONS environment variable
ENV NODE_OPTIONS="--openssl-legacy-provider"


# Copy the entire app directory to the container
COPY . .

# Generate the Nuxt.js static files
RUN npm version patch --git-tag-version false && npx nuxt generate

# Use the official Nginx image as the base image
FROM nginx:1.22.1

ARG ENV_TYPE
ARG WEB_FOLDER

# WORKDIR /var/www/indrz
WORKDIR /usr/share/nginx/html

# COPY devops/docker/local/nginx/conf/allowed.conf /etc/nginx/allowed.conf
# COPY devops/docker/local/nginx/conf/locations.conf /etc/nginx/locations.conf


# Copy the NGINX configuration file to the container
COPY devops/docker/local/nginx/conf/default-dev.conf /etc/nginx/conf.d/default.conf

# RUN mkdir -p /var/www/indrz

# Copy the built static site from the previous stage to the container
#COPY --from=build ./app/dist/ /var/www/indrz
COPY --from=build ./app/dist /usr/share/nginx/html

# Expose port 80
# EXPOSE 80

# Start Nginx when the container starts
# CMD ["nginx", "-g", "daemon off;"]
