<template>
  <div class="fill-height">
    <div :id="mapId" class="fill-height fluid flat width='100%' style='border-radius: 0" />
    <div id="zoom-control" class="indrz-zoom-control" />
    <div id="id-map-switcher-widget">
      <v-btn
        id="id-map-switcher"
        color="rgba(0,60,136,0.5)"
        min-width="95px"
        class="pa-2"
        small
        dark
        @click="onMapSwitchClick"
      >
        {{ isSatelliteMap ? "Satellite" : "Map" }}
      </v-btn>
    </div>
    <div class="indrz-logo">
      <a href="https://www.indrz.com" target="_blank">
        <img id="indrz-logo" src="/images/indrz-powered-by-90px.png" alt="indrz logo">
      </a>
    </div>
    <div v-if="logo.enabled" class="tu-logo">
      <a href="https://www.tuwien.at" target="_blank">
        <img id="tu-logo" :src="logo.file" alt="logo" style="width:auto; height:40px; ">
      </a>
    </div>
    <info-overlay @closeClick="closeIndrzPopup(true)" @shareClick="onShareButtonClick" @popupRouteClick="onPopupRouteClick" />
    <share-overlay ref="shareOverlay" />
    <terms :show="showTerms" @termsShow="onTermShowChange" />
    <help :show="showHelp" @helpShow="onHelpShowChange" />
    <UserGeoLocation :map="map" class="indrz-geolocation" />
  </div>
</template>

<script>
import queryString from 'query-string';
import MapUtil from '../util/map';
import MapHandler from '../util/mapHandler';
import RouteHandler from '../util/RouteHandler';
import POIHandler from '../util/POIHandler';
import InfoOverlay from '../components/infoOverlay';
import ShareOverlay from '../components/shareOverlay';
import 'ol/ol.css';
import menuHandler from '../util/menuHandler';
import Terms from './Terms';
import Help from './Help';
import UserGeoLocation from './UserGeoLocation';

export default {
  components: {
    Help,
    InfoOverlay,
    ShareOverlay,
    Terms,
    UserGeoLocation
  },
  data () {
    return {
      mapId: 'mapContainer',
      map: null,
      view: null,
      showTerms: false,
      showHelp: false,
      isSatelliteMap: true,
      layers: [],
      popup: null,
      activeFloorName: '',
      initialFloor: {},
      globalPopupInfo: {},
      globalSearchInfo: {},
      globalRouteInfo: {},
      objCenterCoords: '',
      popUpHomePage: '',
      currentPOIID: 0,
      currentLocale: 'en',
      routeToValTemp: '',
      routeFromValTemp: '',
      hostUrl: window.location.href,
      routeHandler: RouteHandler(this.$store, this.$t, this)
    };
  },

  computed: {
    logo () {
      return {
        file: process.env.LOGO_FILE,
        enabled: (process.env.LOGO_ENABLED === 'true')
      };
    }
  },

  mounted () {
    const { view, map, layers, popup } = MapUtil.initializeMap(this.mapId, JSON.parse(process.env.DEFAULT_CENTER_XY));

    this.view = view;
    this.map = map;
    this.layers = layers;
    this.popup = popup;

    this.map.on('singleclick', this.onMapClick, this);
    window.onresize = () => {
      setTimeout(() => {
        this.map.updateSize();
      }, 500);
    };
    this.map.on('moveend', (e) => {
      this.$root.$emit('map-moved', e.map.getView().getCenter());
    });
  },

  methods: {
    loadLayers (floors) {
      this.floors = floors;
      if (this.floors && this.floors.length) {
        this.intitialFloor = this.floors.filter(floor => floor.short_name.toLowerCase() === process.env.DEFAULT_START_FLOOR.toLowerCase())[0];
        this.activeFloorName = process.env.LAYER_NAME_PREFIX + this.intitialFloor.short_name.toLowerCase();
        this.$emit('selectFloor', this.activeFloorName);
      }
      this.wmsLayerInfo = MapUtil.getWmsLayers(this.floors, {
        baseWmsUrl: process.env.BASE_WMS_URL,
        geoServerLayerPrefix: process.env.GEO_SERVER_LAYER_PREFIX,
        layerNamePrefix: process.env.LAYER_NAME_PREFIX
      });
      this.layers.layerGroups.push(this.wmsLayerInfo.layerGroup);
      this.layers.switchableLayers = this.wmsLayerInfo.layers;
      this.map.addLayer(this.wmsLayerInfo.layerGroup);
      this.loadMapWithParams();
      this.onFloorClick(this.activeFloorName);
    },
    async onSearchSelect (selection) {
      if (!selection || !selection.data) {
        this.closeIndrzPopup();
        return;
      }
      const selectedItem = selection.data;
      const floorName = selectedItem.properties.floor_name;
      if (floorName) {
        this.$emit('selectFloor', process.env.LAYER_NAME_PREFIX + floorName);
        this.activeFloorName = process.env.LAYER_NAME_PREFIX + floorName;
      }

      const campusId = selectedItem.building;
      const searchText = selectedItem.properties.name;
      const zoomLevel = 20;

      this.globalSearchInfo.searchText = searchText;
      this.objCenterCoords = selectedItem.properties.centerGeometry.coordinates;

      const result = await MapUtil.searchIndrz(this.map, this.layers, this.globalPopupInfo, this.searchLayer, campusId, searchText, zoomLevel,
        this.popUpHomePage, this.currentPOIID, this.currentLocale, this.objCenterCoords, this.routeToValTemp,
        this.routeFromValTemp, this.activeFloorName, this.popup, selectedItem, {
          searchUrl: process.env.SEARCH_URL,
          layerNamePrefix: process.env.LAYER_NAME_PREFIX
        });
      this.searchLayer = result.searchLayer;
    },
    async loadMapWithParams () {
      const query = queryString.parse(location.search);
      await MapUtil.loadMapWithParams(this, query, {
        baseApiUrl: process.env.BASE_API_URL,
        token: process.env.TOKEN,
        searchUrl: process.env.SEARCH_URL,
        layerNamePrefix: process.env.LAYER_NAME_PREFIX
      });
    },
    openIndrzPopup (properties, coordinate, feature) {
      MapHandler.openIndrzPopup(
        this.globalPopupInfo, this.popUpHomePage, this.currentPOIID,
        this.currentLocale, this.objCenterCoords, this.routeToValTemp,
        this.routeFromValTemp, this.activeFloorName, this.popup,
        properties, coordinate, feature, null, process.env.LAYER_NAME_PREFIX
      );
    },
    closeIndrzPopup (fromEvent) {
      MapHandler.closeIndrzPopup(this.popup, this.globalPopupInfo);
      if (this.searchLayer) {
        this.map.removeLayer(this.searchLayer);
        this.searchLayer = null;
      }
      if (fromEvent) {
        this.$emit('clearSearch');
      }
    },
    onShareButtonClick (isRouteShare) {
      const shareOverlay = this.$refs.shareOverlay;
      const url = MapHandler.handleShareClick(this.map, this.globalPopupInfo, this.globalRouteInfo, this.globalSearchInfo, this.activeFloorName, isRouteShare);

      if (typeof url === 'object' && url.type === 'poi') {
        shareOverlay.setPoiShareLink(url);
      } else {
        shareOverlay.setShareLink(url);
      }
      shareOverlay.show();
    },
    loadSinglePoi (poiId) {
      POIHandler.showSinglePoi(poiId, this.globalPopupInfo, 18, this.map, this.popup, this.activeFloorName, process.env.LAYER_NAME_PREFIX);
    },
    onPoiLoad ({ removedItems, newItems, oldItems }) {
      MapHandler.handlePoiLoad(this.map, this.activeFloorName, { removedItems, newItems, oldItems }, {
        baseApiUrl: process.env.BASE_API_URL,
        token: process.env.TOKEN,
        layerNamePrefix: process.env.LAYER_NAME_PREFIX
      });
    },
    onTermShowChange (value) {
      this.showTerms = value;
    },
    onHelpShowChange (value) {
      this.showHelp = value;
    },
    onPopupRouteClick (path) {
      this.$emit('popupRouteClick', {
        path,
        data: this.globalPopupInfo
      });
    },
    onMapClick (evt) {
      MapHandler.handleMapClick(this, evt, process.env.LAYER_NAME_PREFIX);
    },
    onMapSwitchClick () {
      const { baseLayers } = this.layers;

      this.isSatelliteMap = !this.isSatelliteMap;

      if (this.isSatelliteMap) {
        baseLayers.ortho30cmBmapat.setVisible(false);
        baseLayers.greyBmapat.setVisible(true);
        return;
      }
      baseLayers.ortho30cmBmapat.setVisible(true);
      baseLayers.greyBmapat.setVisible(false);
    },
    onMenuButtonClick (type) {
      switch (type) {
        case 'zoom-home':
          menuHandler.handleZoomToHome(this, JSON.parse(process.env.DEFAULT_CENTER_XY));
          break;
        case 'download':
          menuHandler.handleDownLoad(this);
          break;
        case 'pdf':
          menuHandler.handlePdf(this);
          break;
        case 'share-map':
          menuHandler.handleShare(this);
          break;
        case 'help':
          this.showHelp = true;
          break;
        case 'terms':
          this.showTerms = true;
          break;
        default:
          break;
      }
    },
    onLocationClick (centroid) {
      if (!centroid) {
        return;
      }
      this.view.animate({
        center: centroid.coordinates,
        duration: 2000,
        zoom: 18
      });
    },
    onFloorClick (floorName) {
      this.activeFloorName = floorName;
      MapUtil.activateLayer(this.activeFloorName, this.layers.switchableLayers, this.map);
    },
    setGlobalRoute (selectedItem) {
      this.globalRouteInfo[selectedItem.routeType] = selectedItem.data;
    },
    async routeGo () {
      this.globalRouteInfo.routeUrl = await this.routeHandler.routeGo(this.map, this.layers, this.globalRouteInfo, 0, {
        baseApiUrl: process.env.BASE_API_URL,
        layerNamePrefix: process.env.LAYER_NAME_PREFIX,
        token: process.env.TOKEN
      });
    },
    clearRouteData () {
      this.routeHandler.clearRouteData(this.map);
    }
  }
};
</script>

<style scoped>
  .indrz-zoom-control {
    right: 50px !important;
    bottom: 100px !important;
    position: absolute;
  }
  #id-map-switcher-widget {
    position: absolute;
    right: 45px !important;
    bottom: 37px !important;
  }
</style>
