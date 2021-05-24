# INDRZ Frontend
This is the [indrz](https://www.indrz.com) FRONTEND repository. You can find the
 compiled version of the frontend in the `dist` folder.

## Documentation
documentation project here [indrz Docs](https://gitlab.com/indrz/indrz-doc) in the folder content

[Gitlab](https://gitlab.com/indrz/indrz-frontend) hosts the main repo 
Mirror repo is at [Github](https://github.com/indrz/indrz-fe)


----------------------
> Indrz is a web application for indoor wayfinding, mapping and routing. The platform is for example used by a University that wants to provide its guests, staff and students a web map platform to allow them to find anything on campus.

## Setup your development environment
The running frontend code is of no real use without it's best friend the
[BACKEND API](https://gitlab.com/indrz/indrz-backend). Head over to get it
started. Next up:

1. ``git clone https://gitlab.com/indrz/indrz-frontend.git``
1. ``yarn install``
1. ``yarn run dev``

If you have issues with your install these three little steps usually help
```bash
rm -rf node_modules
rm yarn.lock
yarn cache clean
yarn install
```

## Create production build
```
yarn run generate
```
Now just copy the `/dist` folder to your favourite webserver or static file server to serve it up using
nginx, S3, GCP cloud storage, Netlify, you name it.


## Supported Url Parameters
```
q=Hörsaal 14
centerx=1822249.8789
centery=6139919.48
zlevel=20
floor=eg
campus=1
hide_left =false
hide_head=false
hide_footer=false
```

