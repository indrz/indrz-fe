<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ title }}</span>
      </v-card-title>
      <v-card-text class="mb-5">
        <v-container>
          <template v-if="link">
            <v-row class="pl-0 ml-0">
              <v-col cols="12" xs="12" sm="10" md="10">
                <v-text-field ref="linkField" :value="link" hide-details outlined />
              </v-col>
              <v-col
                cols="12"
                xs="12"
                sm="2"
                md="2"
                align="end"
                class="pt-5"
              >
                <v-btn @click="onCopyButtonClick('linkField')" color="blue darken-1" text class="pa-0">
                  <v-icon dark>
                    mdi-content-copy
                  </v-icon>
                  Copy
                </v-btn>
              </v-col>
            </v-row>
          </template>
          <template v-else>
            <v-row class="pl-0 ml-0">
              <v-col cols="12" xs="12" sm="10" md="10">
                <v-text-field
                  ref="singlePoi"
                  :value="poiSingleShareLink"
                  :label="poiSingleShareTitle"
                  hide-details
                  outlined
                  readonly
                />
              </v-col>
              <v-col
                cols="12"
                xs="12"
                sm="2"
                md="2"
                align="end"
              >
                <v-btn @click="onCopyButtonClick('singlePoi')" color="blue darken-1" text class="pa-0">
                  <v-icon dark>
                    mdi-content-copy
                  </v-icon>
                  Copy
                </v-btn>
              </v-col>
            </v-row>
            <v-row class="pl-0 ml-0 mt-10">
              <v-col cols="12" xs="12" sm="10" md="10">
                <v-text-field
                  ref="catPoi"
                  :value="poiCatShareLink"
                  :label="poiCatShareTitle"
                  hide-details
                  outlined
                  readonly
                />
              </v-col>
              <v-col
                cols="12"
                xs="12"
                sm="2"
                md="2"
                align="end"
              >
                <v-btn @click="onCopyButtonClick('catPoi')" color="blue darken-1" text class="pa-0">
                  <v-icon dark>
                    mdi-content-copy
                  </v-icon>
                  Copy
                </v-btn>
              </v-col>
            </v-row>
          </template>
          <v-row>
            <v-col v-if="copyConfirmation" cols="12" sm="8" md="8">
              {{ copyConfirmation }}
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <div class="flex-grow-1" />
        <v-btn @click="dialog = false" color="warning" text>
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ShareOverlay',
  data () {
    return {
      dialog: false,
      title: '',
      searchShareTitle: 'Share search result',
      poiSingleShareTitle: 'Share the POI',
      poiCatShareTitle: 'Share the POI category',
      poiSingleShareLink: '',
      poiCatShareLink: '',
      link: '',
      copyConfirmation: '',
      copySuccess: 'Url successfully copied in to clipboard!'
    };
  },
  watch: {
    dialog () {
      this.copyConfirmation = '';
    }
  },
  methods: {
    show () {
      this.dialog = true;
    },
    close () {
      this.dialog = false;
    },
    setPoiShareLink (url) {
      this.link = '';
      this.title = '';
      this.poiSingleShareLink = url.singlePoiUrl;
      this.poiCatShareLink = url.poiCatUrl;
    },
    setShareLink (link) {
      this.title = this.searchShareTitle;
      this.link = link;
    },
    onCopyButtonClick (fieldRef) {
      const copyTextField = this.$refs[fieldRef];
      const inputField = copyTextField.$el.querySelector('input');
      inputField.select();
      inputField.setSelectionRange(0, 99999);
      document.execCommand('copy');
      this.copyConfirmation = this.copySuccess;
    }
  }
};
</script>

<style scoped>
  .row {
    padding-left: 15px;
  }

  .container, .container-fluid {
    padding-left: 0px;
  }

  body {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    /*overflow: hidden;*/
    padding: 0;
    margin: 0;
    font-family: SignikaLight, Geneva, Helvetica, Arial;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .indrz-main-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
  }

  .indrz-floor-changer-float{
    position: absolute;
    background-color: #0000ff;
    top: 6em;
    font-size: 12px !important;
    left: 10px;
    z-index: 1;
    margin: 1 !important;
    width: 30px;
    margin-bottom: 0;
    font-weight: bold;
    /*padding: 1px 1px !important;*/
  }

  .indrz-floor-changer-float a {

    text-decoration: none;
    padding-left: 4px;
    padding-right: 4px;
  }

  .indrz-floorchanger{
    background-color: #4b45ff !important;
  }

  /*.indrz-map-container { width:100%; height:100%; margin:0; }*/
  #toolbox       { position:absolute; top:98px; right:18px; padding:3px; border-radius:4px; color:#fff; background: rgba(255, 255, 255, 0.4); z-index:100; }
  #layerswitcher { margin:0; padding:15px; border-radius:4px; background:rgba(0, 60, 136, 0.5); list-style-type:none; }

  .indrz-logo {
    position: absolute; /* or absolute */
    bottom: 2%;
    left: 50%;
    z-index: 1001;
  }

  .treeview .list-group-item{
    padding:1px 1px !important;
  }

  .list-group{
    margin-bottom: 0;
  }

  .list-group-item{
    display:block;
    padding: 5px 1px !important;
    background-color: transparent;
    border: transparent;
    margin: 0;

  }
  .list-group-item.active, .list-group-item.active:focus, .list-group-item.active:hover {
    z-index: 2;
    color: #fff;
    background-color: #676767;
    border-color: #337ab7;
    font-weight: bolder;
  }
  main li {
    font-size: 14px;
    line-height: 18px;
  }

  .list-group-item:hover {
    background-color: #65b6f5;
  }
  main a {
    color: #dadada;
    text-decoration: underline;
  }

  .nav-pills>li.active>a, .nav-pills>li.active>a:focus, .nav-pills>li.active>a:hover {
    color: #fff;
    background-color: #4c4c4c !important;
    line-height: 5px !important;
    font-size: 12px !important;
    /*background-color: #000000 !important;*/
  }
  .nav-pills>li>a, .nav-pills>li>a:focus, .nav-pills>li>a {
    color: #0a6aa1;
    line-height: 5px !important;
    font-size: 12px !important;
    /*background-color: #000000 !important;*/
  }
  .indrz-search {
    position: absolute; /* or absolute */
    top: 2%;
    left: 40px;
    z-index: 1002;
  }
  .indrz-search-kiosk {
    position: absolute; /* or absolute */
    top: 0.5em;
    left: 6.7em;
    z-index: 2000;
    width: 25em;
  }
  .indrz-poi-kiosk {
  }
  #poi-panel-body{
    padding:0px;
  }
  .indrz-kiosk-zoom-to-campus{
    left: 4.0em;
  }
  .olImageLoadError { display: none; }

  body {
    padding-top: 60px;
  }
  .ol-attribution {
    max-width: calc(100% - 3em);
  }
  .ol-control button, .ol-attribution, .ol-scale-line-inner {
    font-family: 'Lucida Grande',Verdana,Geneva,Lucida,Arial,Helvetica,sans-serif;
  }
  #tags {
    display: none;
  }
  body, h1, h2, h3, h4, p, li, td, th {
    font-family: 'Quattrocento Sans';
  }
  .navbar-inverse .navbar-inner {
    background: #1F6B75;
  }
  .navbar-inverse .brand {
    color: white;
    padding: 5px;
  }
  .bs-example{
    font-family: sans-serif;
    position: relative;
    margin: 100px;
  }
  .popover-content {
    min-width: 225px;
  }
  /* STYLE CSS for the typeahead drop down */

  .twitter-typeahead .tt-query,
  .twitter-typeahead .tt-hint {
    margin-bottom: 0;
  }
  .tt-hint {
    display: block;
    width: 100%;
    height: 34px;
    padding: 8px 12px;
    font-size: 14px;
    line-height: 1.428571429;
    color: #999;
    vertical-align: middle;
    background-color: #ffffff;
    border: 1px solid #cccccc;
    border-radius: 4px;
    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
    -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
    transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  }
  .tt-menu {
    min-width: 160px;
    margin-top: 2px;
    padding: 5px 0;
    background-color: #ffffff;
    border: 1px solid #cccccc;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
    background-clip: padding-box;
  }
  .tt-suggestion {
    display: block;
    padding: 3px 20px;
    font-size: 12px;

  }
  .tt-suggestion:hover {
    color: #fff;
    background-color: #009ab8;
  }
  .tt-suggestion.tt-is-under-cursor a {
    color: #fff;
  }
  .tt-suggestion p {
    margin: 0;
  }

  #id-map-switcher-widget{
    position: absolute;
    right: 5px;
    top: .5em;
  }
  #id-map-switcher-widget button{
    width: 110px;
    margin-right: 5px;
  }

  #popupFloorNumber{
    padding-left: 5px;
  }

  #popupRoomCode{
    padding-left: 5px;
  }

  #popupRoomCat{
    padding-left: 5px;
  }
  #popupBuilding{
    padding-left: 5px;
  }

  #sharePoiCatPopup{
    background-color: #ff4344;
  }

  .ol-popup {
    position: absolute;
    background-color: white;
    -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    padding: 15px;
    border-radius: 0px;
    border: 1px solid #cccccc;
    bottom: 12px;
    left: -50px;
    min-width: 220px;
    z-index: 1;
  }
  .ol-popup:after, .ol-popup:before {
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }
  .ol-popup:after {
    border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
  }
  .ol-popup:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
  }
  .ol-popup-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
  }
  .ol-popup-closer:after {
    content: "X";
  }

  .ol-zoom {
    top: .2em;
    left: .5em;
    border-radius: 0;
  }

  .ol-zoom .ol-zoom-in {
    border-radius: 0;
  }

  .ol-zoom .ol-zoom-out{
    border-radius: 0;
  }

  .ol-control button:focus, .ol-control button:hover {
    text-decoration: none;
    background-color: rgba(19, 19, 19, 0.7);
  }

  .ol-control button {
    display: block;
    margin: 3px;
    margin-top: 0.17em;
    margin-right: 1px;
    margin-bottom: 2px;
    margin-left: 1px;
    padding: 0;
    color: #fff;
    font-size: 1.4em;
    font-weight: 700;
    text-decoration: none;
    text-align: center;
    height: 1.375em;
    width: 1.375em;
    line-height: .4em;
    background-color: #0a6aa1;
    border: none;
    border-radius: 0px;
  }

  .twitter-typeahead{ float:left; width:100%}
  /* END  STYLE CSS for the TYPEAHEAD drop down */

  .navbar {
    margin-bottom: 0;
  }

  #map {
    position: relative;
  }

  @media (max-width: 990px) {
    #id-map-switcher-widget {
      position: absolute;
      top: 0.5em;
      right: 6em;

      left: auto;
      bottom: auto;

    }

    .indrz-floor-changer-float {
      font-size: 12px;
      position: absolute;
      top: 6em;
      width: 65px;
      background-color: #d81d98;
    }

    #id-map-switcher-widget button {
      width: auto;
      height: 2.85em;
    }

    #map-search-form {
      display: none;
    }

    #map-search-form.collapse.in {
      display: block;
    }

    .navbar-toggle {
      float: left !important ;
      display: block;
      margin-left: 2em;
    }

    .navbar-header {
      float: left !important ;
    }
  }

  @media (min-width: 990px) {
    #map-search-form {
      display: block !important;
    }

    .indrz-floor-changer-float{
      position: absolute;
      /*background-color: rgba(51, 51, 51, 0.5);*/
      background-color: #0a6aa1;
      top: 6em;
      font-size: 12px !important;
      right: 10px;
      z-index: 1;
      margin: 1 !important;
      width: 28px;
      margin-bottom: 0;
      font-weight: bold;
      text-align: center;
      /*padding: 1px 1px !important;*/
    }

    .indrz-floor-changer-float a {

      text-decoration: none;
      padding-left: 4px;
    }
    .navbar-toggle {
      float:left !important;
      display: none;
    }
  }

  .navbar-toggle {
    float: left  ;
    display: block;
    margin-left: 2em;
  }

  .indrz-logo {
    width: 100%;
    text-align: center;
    left: auto;
  }

  h3 {
    display: block;
    font-size: 1.17em;
    -webkit-margin-before: 1em;
    -webkit-margin-after: 1em;
    -webkit-margin-start: 0px;
    -webkit-margin-end: 0px;
    font-weight: bold;
    color:black !important;
  }

  .jstree-anchor{
    font-size: 14px !important;
  }

  #searchTools{
    display: none;

  }

  .indrz-search-tools{
    padding-bottom: 15px !important;
    padding-top: 5px;

  }

  .indrz-popup p{
    font-family: Arial,sans-serif;
    font-size: 12px;
    letter-spacing: .1px;
    line-height: 12px;
    color: black;
    z-index: 0;

  }

  #popup-links a{
    margin-bottom: 5px;

  }

  .indrz-toolbar{
    position: absolute;
    top: .5em;
    left: 3.9em;

  }

  .indrz-search-box {
    margin-top: 10px;
  }

  #search-res {
    max-height: 250px;
    overflow-y:scroll;
  }

  .searchbox-wu{
    padding-left: 0px;
    padding-right:12px;
  }

  .fa {
    display: inline-block;
    font: normal normal normal 10px/1 FontAwesome;
    font-size: 14px;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding-left: 3px;

  }

  .jstree-icon:empty{
    vertical-align: middle;
  }
  .jstree-icon{
    vertical-align: middle;
  }

  .indrz-modal-share h4{
    font-size: 14px !important;
    text-align: left !important;
  }

  .indrz-modal-share p{
    font-size: 14px !important;
    text-align: left !important;
  }

  #textAreaShareMap {
    /*resize: none;*/
    /*overflow: hidden;*/
    min-height: 80px;
    width:100%;

  }

  #textAreaShareSearch{
    min-height: 50px;
    width:100%;
  }

  #textAreaShareRoute{
    min-height: 80px;
    width:100%;
  }

  @media (max-width: 650px) {

    #id-map-switcher-widget {
      position: absolute;
      top: 0.5em;
      right: 0.7em;
      left: auto;
      bottom: auto;
    }
    .indrz-floor-changer-float {
      position: absolute;
      top: 6em;
      width: 60px;
      font-size: 12px;

    }

    .sm-floor-changer{
      background-color: black;
      color:white;
    }
    #poi-accordian{
      /*visibility: hidden;*/
      display:none;
    }
  }
  color:black;

  #popupTable td{
    padding-left: 5px;
  }
  /* context menu */
  .indrz-context-menu {
    display: none;
    position: absolute;
    z-index: 10;
    padding: 12px 0;
    width: 240px;
    background-color: #fff;
    border: solid 1px #dfdfdf;
    box-shadow: 1px 1px 2px #cfcfcf;
  }

  .indrz-context-menu--active {
    display: block;
  }

  .indrz-context-menu__items {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .indrz-context-menu__item {
    display: block;
    margin-bottom: 4px;
  }

  .indrz-context-menu__item:last-child {
    margin-bottom: 0;
  }

  .indrz-context-menu__link {
    display: block;
    padding: 4px 12px;
    color: #0066aa;
    text-decoration: none;
  }

  .indrz-context-menu__link:hover {
    color: #fff;
    background-color: #0066aa;
  }

  .btn-primary {
    color: #fff;
    background-color: #0066aa;
    border-color: #8293a4;
    border-radius: 0!important;
    border: 0!important;
  }
</style>
