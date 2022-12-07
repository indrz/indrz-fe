FROM node:43-alpine

ENV APP_ROOT /src

# update and install dependency
RUN apk update && apk upgrade
RUN apk add git

# create destination directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# copy the app, note .dockerignore
COPY . /usr/src/app/

# build necessary, even if no static files are needed,
# since it builds the server as well
RUN yarn install
RUN yarn run generate

ENV HOST 0.0.0.0

# expose 3000 on container
EXPOSE 3000

# start the app
CMD [ "yarn", "start" ]
