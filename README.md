# INDRZ Frontend
For the main documentation please visit [indrz documentation](https://gitlab.com/indrz/indrz-doc.git) Built with Vuejs, Nuxt and Vuetify.

> Indrz is a web application for indoor wayfinding, mapping and routing. The platform is for example used by a University that wants to provide its guests, staff and students a web map platform to allow them to find anything on campus.

## Development Setup
You need a static webserver such as nginx or apache, google-storage, s3 bucket, whatever gets you going.

1. Clone the repo ``git clone https://gitlab.com/indrz/indrz-frontend.git``
1. ``yarn install``
1. ``yarn run dev``

If you have issues with your install these three little steps usually help
```bash
rm -rf node_modules
rm yarn.lock
yarn clean cache
yarn install
```

## Create production build
```
yarn build
```
