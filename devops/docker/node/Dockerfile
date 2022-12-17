FROM node:18.12.1-alpine

# create destination directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# update and install dependency
RUN apk update && apk upgrade
RUN apk add git

# copy the app, note .dockerignore
COPY . /usr/src/app/

# build necessary, even if no static files are needed,
# since it builds the server as well
RUN yarn
RUN yarn generate

# expose 3000 on container
EXPOSE 3000

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# start the app
CMD [ "yarn", "start" ]
