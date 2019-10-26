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
      <a href="http://www.indrz.com" target="_blank">
        <img id="indrz-logo" src="/images/indrz-powered-by-90px.png" />
      </a>
    </div>
    <info-overlay @closeClick="closeIndrzPopup(true)" @shareClick="onShareButtonClick" @popupRouteClick="onPopupRouteClick" />
    <share-overlay ref="shareOverlay" />
  </div>
</template>

<script>
import axios from 'axios';
import { saveAs } from 'file-saver';
import Overlay from 'ol/Overlay';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { defaults as defaultInteraction } from 'ol/interaction';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import PinchZoom from 'ol/interaction/PinchZoom';
import Vector from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { getCenter } from 'ol/extent';
import queryString from 'query-string';
import MapUtil from '../util/map';
import MapHandler from '../util/mapHandler';
import RouteHandler from '../util/RouteHandler';
import POIHandler from '../util/POIHandler';
import InfoOverlay from '../components/infoOverlay'
import ShareOverlay from '../components/shareOverlay'
import 'ol/ol.css';
import indrzConfig from '../util/indrzConfig';

export default {
  components: {
    InfoOverlay,
    ShareOverlay
  },
  data () {
    return {
      mapId: 'mapContainer',
      map: null,
      view: null,
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
      routeHandler: RouteHandler(this.$store)
    };
  },

  mounted () {
    this.view = new View({
      center: MapUtil.getStartCenter(),
      zoom: 17,
      maxZoom: 23
    });

    this.layers = MapUtil.getLayers();

    this.map = new Map({
      interactions: defaultInteraction().extend([
        new DragRotateAndZoom(),
        new PinchZoom({
          constrainResolution: true
        })
      ]),
      target: this.mapId,
      controls: MapUtil.getMapControls(),
      view: this.view,
      layers: this.layers.layerGroups
    });
    this.popup = new Overlay({
      element: document.getElementById('indrz-popup'),
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      },
      zIndex: 5,
      name: 'indrzPopup'
    });
    this.map.addOverlay(this.popup);

    this.map.on('singleclick', this.onMapClick, this);
    window.onresize = () => {
      setTimeout(() => {
        this.map.updateSize();
      }, 500);
    };
  },

  methods: {
    loadLayers (floors) {
      this.floors = floors;
      if (this.floors && this.floors.length) {
        this.intitialFloor = this.floors.filter(floor => floor.short_name.toLowerCase() === indrzConfig.defaultStartFloor)[0];
        this.activeFloorName = indrzConfig.layerNamePrefix + this.intitialFloor.short_name.toLowerCase();
        this.$emit('selectFloor', this.activeFloorName);
      }
      this.wmsLayerInfo = MapUtil.getWmsLayers(this.floors);
      this.layers.layerGroups.push(this.wmsLayerInfo.layerGroup);
      this.layers.switchableLayers = this.wmsLayerInfo.layers;
      this.map.addLayer(this.wmsLayerInfo.layerGroup);
      this.loadMapWithParams();
      this.onFloorClick(this.activeFloorName);
    },
    async onSearchSelect (selection) {
      const selectedItem = selection.data;
      if (!selectedItem) {
        this.closeIndrzPopup();
        return;
      }
      const campusId = selectedItem.building;
      const searchText = selectedItem.properties.name;
      const zoomLevel = 20;

      this.globalSearchInfo.searchText = searchText;
      this.objCenterCoords = selectedItem.properties.centerGeometry.coordinates;

      const result = await MapUtil.searchIndrz(this.map, this.layers, this.globalPopupInfo, this.searchLayer, campusId, searchText, zoomLevel,
        this.popUpHomePage, this.currentPOIID, this.currentLocale, this.objCenterCoords, this.routeToValTemp,
        this.routeFromValTemp, this.activeFloorName, this.popup, selectedItem);
      this.searchLayer = result.searchLayer;
      if (result.floorName) {
        this.$emit('selectFloor', indrzConfig.layerNamePrefix + result.floorName);
      }
    },
    async loadMapWithParams () {
      const query = queryString.parse(location.search);
      const campusId = query.campus || 1;
      const zoomLevel = query.zlevel || 18;

      if (query.centerx !== 0 && query.centery !== 0 && isNaN(query.centerx) === false) {
        const view = this.map.getView();
        view.animate({ zoom: zoomLevel }, { center: [query.centerx, query.centery] });
      }
      if (query.floor) {
        this.activeFloorName = query.floor;
        MapUtil.activateLayer(this.activeFloorName, this.layers.switchableLayers, this.map);
        this.$emit('selectFloor', this.activeFloorName);
      }
      if (query.q && query.q.length > 3) {
        const result = await MapUtil.searchIndrz(this.map, this.layers, this.globalPopupInfo, this.searchLayer, campusId, query.q, zoomLevel,
          this.popUpHomePage, this.currentPOIID, this.currentLocale, this.objCenterCoords, this.routeToValTemp,
          this.routeFromValTemp, this.activeFloorName, this.popup);

        if (result.floorName) {
          this.$emit('selectFloor', indrzConfig.layerNamePrefix + result.floorName);
        }
        this.searchLayer = result.searchLayer;
      }
      if (query['start-spaceid'] && query['end-spaceid']) {
        const startSpaceId = query['start-spaceid'];
        const endSpaceId = query['end-spaceid'];

        this.$emit('popupRouteClick', {
          path: 'from',
          data: {
            spaceid: startSpaceId,
            name: startSpaceId
          }
        });
        this.$emit('popupRouteClick', {
          path: 'to',
          data: {
            spaceid: endSpaceId,
            name: endSpaceId
          }
        });
        setTimeout(async () => {
          this.globalRouteInfo.routeUrl = await this.routeHandler.getDirections(this.map, this.layers, query['start-spaceid'], query['end-spaceid'], '0', 'spaceIdToSpaceId');
        }, 600);
      }
      if (query['poi-cat-id']) {
        this.$emit('openPoiTree', query['poi-cat-id']);
      }
      if (query['poi-id']) {
        this.$emit('openPoiTree', query['poi-id'], true);
      }
    },
    openIndrzPopup (properties, coordinate, feature) {
      MapHandler.openIndrzPopup(
        this.globalPopupInfo, this.popUpHomePage, this.currentPOIID,
        this.currentLocale, this.objCenterCoords, this.routeToValTemp,
        this.routeFromValTemp, this.activeFloorName, this.popup,
        properties, coordinate, feature
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
      POIHandler.showSinglePoi(poiId, this.globalPopupInfo, 20, this.map, this.activeFloorName);
    },
    onPoiLoad ({ removedItems, newItems, oldItems }) {
      if (removedItems && removedItems.length) {
        removedItems.forEach((item) => {
          if (POIHandler.poiExist(item, this.map)) {
            POIHandler.disablePoiById(item.id, this.map);
          }
        });
      }
      if (oldItems && oldItems.length) {
        oldItems.forEach((item) => {
          POIHandler.setPoiVisibility(item, this.map);
        })
      }
      if (newItems && newItems.length) {
        newItems.forEach((item) => {
          if (POIHandler.poiExist(item, this.map)) {
            POIHandler.setPoiVisibility(item.id, this.map);
          } else {
            POIHandler
              .fetchPoi(item.id, this.map, this.activeFloorName)
              .then((poiLayer) => {
                this.map.getLayers().forEach((layer) => {
                  if (layer.getProperties().id === 99999) {
                    layer.getLayers().push(poiLayer);
                  }
                });
              });
          }
        })
      }
    },
    onPopupRouteClick (path) {
      this.$emit('popupRouteClick', {
        path,
        data: this.globalPopupInfo
      });
    },
    onMapClick (evt) {
      const pixel = evt.pixel;
      let feature = this.map.getFeaturesAtPixel(pixel);
      const features = [];

      this.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
        features.push(feature);
      });
      feature = features[0];
      let coordinate = this.map.getCoordinateFromPixel(pixel);
      const properties = feature ? feature.getProperties() : null;

      if (feature) {
        const featureType = feature.getGeometry().getType().toString();

        if (featureType === 'MultiPolygon' || featureType === 'MultiPoint') {
          MapHandler.closeIndrzPopup(this.popup, this.globalPopupInfo);
          if (featureType === 'MultiPoint') {
            properties.poiId = feature.getId();
            properties.src = 'poi';
          }

          this.openIndrzPopup(properties, coordinate, feature);
          MapUtil.activateFloor(feature, this.layers, this.map);
        } else if (featureType === 'Point') {
          MapHandler.closeIndrzPopup(this.popup, this.globalPopupInfo);
          coordinate = this.map.getCoordinateFromPixel(pixel);
          properties.src = 'poi';
          if (feature.getProperties().hasOwnProperty('poi_id')) {
            properties.poiId = feature.properties.poi_id;
          }

          this.openIndrzPopup(properties, coordinate, feature);
          MapUtil.activateFloor(feature, this.layers, this.map);
        }
      } else {
        const featuresWms = this.map.getFeaturesAtPixel(pixel);
        const v = this.map.getView();
        const viewResolution = /** @type {number} */ (v.getResolution());
        const wmsSource2 = MapHandler.getRoomInfo(this.activeFloorName, this.layers);
        const url = wmsSource2.getGetFeatureInfoUrl(coordinate, viewResolution, 'EPSG:3857', {
          'INFO_FORMAT': 'application/json',
          'FEATURE_COUNT': 50
        });

        if (url) {
          axios.get(url).then((response) => {
            this.globalPopupInfo.src = 'wms';
            const listFeatures = response.data && response.data.features ? response.data.features : [];
            const dataProperties = {};

            if (listFeatures.length > 0) {
              listFeatures.forEach(function (feature) {
                if (feature.properties.hasOwnProperty('space_type_id')) {
                  if (feature.properties.hasOwnProperty('room_code') || feature.properties.hasOwnProperty('roomcode')) {
                    const centroidSource = new Vector({
                      features: (new GeoJSON()).readFeatures(feature)
                    });
                    const centroidCoords = getCenter(centroidSource.getExtent());
                    if (!dataProperties.properties) {
                      dataProperties.properties = {};
                    }
                    dataProperties.properties = { ...dataProperties.properties, ...feature.properties };
                    dataProperties.centroid = centroidCoords;
                  }
                }
              });
              dataProperties.properties.src = 'wms';
              this.openIndrzPopup(dataProperties.properties, dataProperties.centroid, featuresWms)
            }
          });
        }
      }
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
          this.view.animate({
            center: MapUtil.getStartCenter(),
            duration: 2000,
            zoom: 17
          });
          break;
        case 'download':
          this.map.once('postcompose', function (event) {
            const canvas = event.context.canvas;
            const curDate = new Date();

            if (canvas.toBlob) {
              canvas.toBlob(function (blob) {
                saveAs(blob, curDate.toLocaleDateString() + '_map.png')
              }, 'image/png');
            }
          });
          this.map.renderSync();
          break;
        case 'share-map':
          const url = MapHandler.updateUrl('map', this.map, this.globalPopupInfo, this.globalRouteInfo, this.globalSearchInfo, this.activeFloorName);
          const shareOverlay = this.$refs.shareOverlay;
          if (typeof url === 'object' && url.type === 'poi') {
            shareOverlay.setPoiShareLink(url);
          } else {
            shareOverlay.setShareLink(location.href);
          }
          shareOverlay.show();
          break;
        default:
          break;
      }
    },
    onLocationClick (centroid) {
      this.view.animate({
        center: centroid.coordinates,
        duration: 2000,
        zoom: 16
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
      this.globalRouteInfo.routeUrl = await this.routeHandler.routeGo(this.map, this.layers, this.globalRouteInfo);
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
