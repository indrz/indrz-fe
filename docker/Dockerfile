FROM node:13-alpine

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
RUN yarn build
#RUN npm run build

#ENV HOST 0.0.0.0

# expose 3000 on container
EXPOSE 3000

# start the app
ENV HOST=0.0.0.0
ENV PORT=3000

CMD [ "yarn", "start" ]
