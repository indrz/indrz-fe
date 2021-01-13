# INDRZ Frontend

> Indrz is a web application for indoor wayfinding, mapping and routing. The platform is for example used by a University that wants to provide its guests, staff and students a web map platform to allow them to find anything on campus.

## Installation
You need a static webserver such as nginx or apache, google-storage, s3 bucket, whatever gets you going.

1. Clone the repo
1. Rename `util/indrzConf.sample.json` to `indrzConf.js` if you want to change settings
1. Install dependencies`yarn install`
1. generate static project`yarn build`
1. Push the `dist` directory under a static file web server like nginx, s3, ....

## Development
serve with hot reload at localhost:3000

`yarn run dev`


For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
