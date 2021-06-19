<template>
  <div>
    <div :id="mapId" class="width='100%' style='border-radius: 0" />
    <div id="zoom-control" class="indrz-zoom-control" />
    <div id="id-map-switcher-widget">
      <v-btn
        id="id-map-switcher"
        @click="onMapSwitchClick"
        min-width="95px"
        class="pa-2 map-switcher"
        small
        dark
      >
        {{ isSatelliteMap ? "Satellite" : "Map" }}
      </v-btn>
    </div>
    <div class="indrz-powered-logo">
      <a href="https://www.indrz.com" target="_blank">
        <img id="indrz-powered-logo" src="/images/powered-by-indrz-blue-transparent-text+logo.png" alt="indrz logo">
      </a>
    </div>
    <div class="logo-on-map">
      <a href="https://indrz.com" target="_blank">
        <img id="logo-on-map" :src="logo.file" alt="logo" style="width:auto; height:40px; ">
      </a>
    </div>
    <info-overlay
      @closeClick="closeIndrzPopup(true)"
      @shareClick="onShareButtonClick"
      @popupRouteClick="onPopupRouteClick"
      @popupEntranceButtonClick="onPopupEntranceButtonClick"
      @popupMetroButtonClick="onPopupMetroButtonClick"
      @popupDefiButtonClick="onPopupDefiButtonClick"
    />
    <share-overlay ref="shareOverlay" />
    <terms :show="showTerms" @termsShow="onTermShowChange" />
    <help :show="showHelp" @helpShow="onHelpShowChange" />
    <QRCode :show="showQrCode" @qrCodeShow="onQrCodeShow" @qrCodeScanned="loadMapWithParams" />
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
import 'ol/ol.css';
import config from '../util/indrzConfig';
import menuHandler from '../util/menuHandler';
import ShareOverlay from './share-overlay/shareOverlay';
import Terms from './Terms';
import Help from './Help';
import UserGeoLocation from './UserGeoLocation';
import QRCode from './QRCode';

const { env } = config;

export default {
  components: {
    QRCode,
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
      showQrCode: false,
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
      routeHandler: RouteHandler(this.$store, this.$t, this),
      headerId: 'indrz-header-container',
      footerId: 'indrz-footer-container'
    };
  },

  computed: {
    logo () {
      return {
        file: env.LOGO_FILE,
        enabled: (env.LOGO_ENABLED === true)
      };
    }
  },

  mounted () {
    const query = queryString.parse(location.search);
    this.showHideHeaderFooter(query);

    const { view, map, layers, popup } = MapUtil.initializeMap(this.mapId);

    this.view = view;
    this.map = map;
    this.layers = layers;
    this.popup = popup;

    this.map.on('singleclick', this.onMapClick, this);
    window.onresize = () => {
      this.map.updateSize();
      MapUtil.handleWindowResize(this.mapId);
    };
    this.map.on('moveend', (e) => {
      this.$root.$emit('map-moved', e.map.getView().getCenter());
    });
  },

  methods: {
    loadLayers (floors) {
      this.floors = floors;
      if (this.floors && this.floors.length) {
        this.intitialFloor = this.floors.filter(floor => floor.floor_num === env.DEFAULT_START_FLOOR)[0];
        this.activeFloorName = this.activeFloorName = env.LAYER_NAME_PREFIX + this.intitialFloor.short_name.toLowerCase();
        const floor = env.LAYER_NAME_PREFIX + this.intitialFloor.floor_num.toFixed(1).toString().replace('-', 'u').replace('.', '_');
        this.$emit('selectFloor', floor);
      }
      this.wmsLayerInfo = MapUtil.getWmsLayers(this.floors, {
        baseWmsUrl: env.BASE_WMS_URL,
        geoServerLayerPrefix: env.GEO_SERVER_LAYER_PREFIX,
        layerNamePrefix: env.LAYER_NAME_PREFIX
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
      const floorName = selectedItem.properties.floor_num.toFixed(1).toString().replace('-', 'u').replace('.', '_');
      if (floorName) {
        this.$emit('selectFloor', env.LAYER_NAME_PREFIX + floorName);
        this.activeFloorName = env.LAYER_NAME_PREFIX + floorName;
      }

      const campusId = selectedItem.building;
      const searchText = selectedItem.properties.name;
      const zoomLevel = 20;

      this.globalSearchInfo.searchText = searchText;
      this.objCenterCoords = selectedItem.properties.centerGeometry.coordinates;

      const result = await MapUtil.searchIndrz(this.map, this.layers, this.globalPopupInfo, this.searchLayer, campusId, searchText, zoomLevel,
        this.popUpHomePage, this.currentPOIID, this.currentLocale, this.objCenterCoords, this.routeToValTemp,
        this.routeFromValTemp, this.activeFloorName, this.popup, selectedItem, {
          searchUrl: env.SEARCH_URL,
          layerNamePrefix: env.LAYER_NAME_PREFIX
        });
      this.searchLayer = result.searchLayer;
    },
    async loadMapWithParams (searchString) {
      const query = queryString.parse(searchString || location.search);
      await MapUtil.loadMapWithParams(this, query);
    },
    openIndrzPopup (properties, coordinate, feature) {
      MapHandler.openIndrzPopup(
        this.globalPopupInfo, this.popUpHomePage, this.currentPOIID,
        this.currentLocale, this.objCenterCoords, this.routeToValTemp,
        this.routeFromValTemp, this.activeFloorName, this.popup,
        properties, coordinate, feature, null, env.LAYER_NAME_PREFIX
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
      POIHandler.showSinglePoi(poiId, this.globalPopupInfo, 18, this.map, this.popup, this.activeFloorName, env.LAYER_NAME_PREFIX);
    },
    onPoiLoad ({ removedItems, newItems, oldItems }) {
      MapHandler.handlePoiLoad(this.map, this.activeFloorName, { removedItems, newItems, oldItems }, {
        baseApiUrl: env.BASE_API_URL,
        token: env.TOKEN,
        layerNamePrefix: env.LAYER_NAME_PREFIX
      });
    },
    onTermShowChange (value) {
      this.showTerms = value;
    },
    onHelpShowChange (value) {
      this.showHelp = value;
    },
    onQrCodeShow (value) {
      this.showQrCode = value;
    },
    onPopupRouteClick (path) {
      this.$emit('popupRouteClick', {
        path,
        data: this.globalPopupInfo
      });
    },
    onMapClick (evt) {
      MapHandler.handleMapClick(this, evt, env.LAYER_NAME_PREFIX);
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
          menuHandler.handleZoomToHome(this, env.DEFAULT_CENTER_XY);
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
        case 'qrcode':
          this.showQrCode = true;
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
    async onPopupEntranceButtonClick () {
      const nearestEntrance = await this.routeHandler.getNearestEntrance(this.globalPopupInfo);

      if (nearestEntrance) {
        this.$emit('popupRouteClick', {
          path: 'from',
          data: nearestEntrance
        });
      }
    },
    async onPopupMetroButtonClick () {
      const nearestMetro = await this.routeHandler.getNearestMetro(this.globalPopupInfo);

      if (nearestMetro) {
        this.$emit('popupRouteClick', {
          path: 'from',
          data: nearestMetro
        });
      }
    },
    async onPopupDefiButtonClick () {
      const nearestDefi = await this.routeHandler.getNearestDefi(this.globalPopupInfo);

      if (nearestDefi) {
        this.$emit('popupRouteClick', {
          path: 'to',
          data: nearestDefi
        });
      }
    },
    setGlobalRoute (selectedItem) {
      this.globalRouteInfo[selectedItem.routeType] = selectedItem.data;
    },
    async routeGo () {
      this.globalRouteInfo.routeUrl = await this.routeHandler.routeGo(this.map, this.layers, this.globalRouteInfo, 0, {
        baseApiUrl: env.BASE_API_URL,
        layerNamePrefix: env.LAYER_NAME_PREFIX,
        token: env.TOKEN
      });
    },
    clearRouteData () {
      this.routeHandler.clearRouteData(this.map);
    },
    showHideHeaderFooter (query) {
      if (query.hideHeader && query.hideHeader === 'true') {
        document.getElementById(this.headerId).style.display = 'none';
      }
      if (query.hideFooter && query.hideFooter === 'true') {
        document.getElementById(this.footerId).style.display = 'none';
      }
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
