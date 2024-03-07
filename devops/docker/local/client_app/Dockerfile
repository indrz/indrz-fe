# Dockerfile
FROM node:18.12.1-alpine

# create destination directory
RUN mkdir -p /app
WORKDIR /app

# update and install dependency
RUN apk update && apk upgrade
RUN apk add git

# copy the app, note .dockerignore
COPY . /app/
# Install the dependencies
RUN yarn install

RUN yarn install --save-dev @babel/plugin-proposal-private-property-in-object

RUN yarn run build

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
# Set the NODE_OPTIONS environment variable
ENV NODE_OPTIONS="--openssl-legacy-provider"

CMD [ "npm", "start" ]