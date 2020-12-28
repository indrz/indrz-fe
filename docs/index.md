# Documentation for Indrz frontend development


## How to customize the design
You can customize the design

### Fonts
The font library (default google material icons) We can add the material design icons as plugin under plugins directory. Read from config

Vuetify 2+
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
Logos are possible in the following locations:
1. logo upper right shown on map logoPath = ./somepath/logo.png  shouldShowLogo = true
1. logo top left menu panel
1. favicon faviconIcon = ./somepath/logo.png

### Floor Changer
On the right side you can style the floor changer by changing the file.....add..file..here...

### Header
At the top you can add an optional header that will appear above the map.

`options:  showHeader = False  (default: False)`

### Footer
Below the map window you can have an optional Footer.

`options:  showFooter = False  (default: False)`
