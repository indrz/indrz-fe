# Documentation for Indrz frontend development


## How to customize the design
You can customize the design of the following elements:

1. font
1. logos, favicon
   1. upper right shown on map logoPath = ./somepath/logo.png shouldShowLogo = true
   1. logo top left menu panel
    1. favicon faviconIcon = ./somepath/logo.png
1. buttons left menue
    1. show all locations
    1. Share map
    1. Download Map as Image
    1. Download Map as PDF
    1. About / Terms and Conditions
1. Floor Changer
1. Header, Footer

### Fonts
The font library (default google material icons)

Vuetify 2+  how to change the font
```javascript

@import url('https://fonts.googleapis.com/css? family=Oxygen:300,400,700&display=swap');
@import url('https://fonts.googleapis.com/css? family=Comfortaa&display=swap');

$body-font-family: 'Oxygen';
$title-font: 'Comfortaa';


.v-application {
   font-family: $body-font-family, sans-serif !important;
    .title { // To pin point specific classes of some components
       font-family: $title-font, sans-serif !important;
    }
 }
```


### Logos and Favicon
Logos are located in the following locations:
1. logo upper right shown on map
1. logo top left menu panel
1. favicon faviconIcon = ./somepath/logo.png

To change the logo and favicon you need to use  `thisfile.vue ` 

```javascript
    logoOnMap = "somepath"
    logoOnLeftMenu = "somepath"
    favicon = "somepath"
```



### Floor Changer
On the right side you can style the floor changer by changing the file.....add..file..here...

To change the floor changer design you need to use  `thisfile.vue ` 

```javascript

    something = "something"
```

### Header
At the top you can add an optional header that will appear above the map.

To add a header you need to use  `thisfile.vue ` 

```javascript

    something = "something"
    showHeader = False  (default: False)
```


### Footer
Below the map window you can have an optional Footer.

To add a header you need to use  `thisfile.vue ` 

```js
 
    something = "something"
    showFooter = False  //(default: False)
```

## Localization Translations
The localization is handled using [vue-i18n](https://kazupon.github.io/vue-i18n)

here an example if you want to change languages with a button for example
```js
const i18n = new VueI18n({
  locale: 'de', // set locale
  ...
})

// create root Vue instance
new Vue({
  i18n,
  ...
}).$mount('#app')

// change other locale
i18n.locale = 'en'
```


