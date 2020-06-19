<template>
  <div class="fill-height">
    <div :id="mapId" class="fill-height fluid flat width='100%' style='border-radius: 0" />
    <div id="zoom-control" class="indrz-zoom-control" />
    <div id="id-map-switcher-widget">
      <v-btn
        id="id-map-switcher"
        @click="onMapSwitchClick"
        color="rgba(0,60,136,0.5)"
        min-width="95px"
        class="pa-2"
        small
        dark
      >
        {{ isSatelliteMap ? "Satellite" : "Map" }}
      </v-btn>
    </div>
    <div class="indrz-logo">
      <a href="https://www.indrz.com" target="_blank">
        <img id="indrz-logo" src="/images/indrz-powered-by-90px.png" alt="indrz logo">
      </a>
    </div>
    <div class="tu-logo">
      <a href="https://www.tuwien.at" target="_blank">
        <img id="tu-logo" src="/images/tu-logo.png" alt="tulogo" style="width:auto; height:40px; ">
      </a>
    </div>
    <info-overlay @closeClick="closeIndrzPopup(true)" @shareClick="onShareButtonClick" @popupRouteClick="onPopupRouteClick" />
    <share-overlay ref="shareOverlay" />
    <terms :show="showTerms" @termsShow="onTermShowChange" />
    <help :show="showHelp" @helpShow="onHelpShowChange" />
  </div>
</template>

<script>
import axios from 'axios';
import JSPDF from 'jspdf';
import { saveAs } from 'file-saver';
import Vector from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { getCenter } from 'ol/extent';
import queryString from 'query-string';
import MapUtil from '../util/map';
import MapHandler from '../util/mapHandler';
import RouteHandler from '../util/RouteHandler';
import POIHandler from '../util/POIHandler';
import InfoOverlay from '../components/infoOverlay';
import ShareOverlay from '../components/shareOverlay';
import 'ol/ol.css';
import indrzConfig from '../util/indrzConfig';
import Terms from './Terms';
import Help from './Help';

export default {
  components: {
    Help,
    InfoOverlay,
    ShareOverlay,
    Terms
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

  mounted () {
    const { view, map, layers, popup } = MapUtil.initializeMap(this.mapId);

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
  },

  methods: {
    loadLayers (floors) {
      this.floors = floors;
      if (this.floors && this.floors.length) {
        this.intitialFloor = this.floors.filter(floor => floor.short_name.toLowerCase() === indrzConfig.defaultStartFloor.toLowerCase())[0];
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
      if (!selection || !selection.data) {
        this.closeIndrzPopup();
        return;
      }
      const selectedItem = selection.data;
      const floorName = selectedItem.properties.floor_name;
      if (floorName) {
        this.$emit('selectFloor', indrzConfig.layerNamePrefix + floorName);
        this.activeFloorName = indrzConfig.layerNamePrefix + floorName;
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

        this.$root.$emit('load-search-query', query.q);

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
      POIHandler.showSinglePoi(poiId, this.globalPopupInfo, 18, this.map, this.popup, this.activeFloorName);
    },
    onPoiLoad ({ removedItems, newItems, oldItems }) {
      MapHandler.handlePoiLoad(this.map, this.activeFloorName, { removedItems, newItems, oldItems });
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
      MapHandler.handleMapClick(this, evt);
    },
    onMapClick_ (evt) {
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
            zoom: 15
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
        case 'pdf':
          const map = this.map;
          const activeFloorName = this.activeFloorName;
          this.map.once('postcompose', function (event) {
            const canvas = event.context.canvas;
            const mapSize = MapUtil.getMapSize(map);

            const canvasMapHeight = mapSize.height_px;
            const canvasMapWidth = mapSize.width_px;

            const ratio = canvasMapHeight / canvasMapWidth;

            let pageOrientation = 'landscape';

            if (ratio > 1) {
              pageOrientation = 'portrait';
            }

            let today = new Date();
            let dd = today.getDate();
            let mm = today.getMonth() + 1; // January is 0!

            const yyyy = today.getFullYear();
            if (dd < 10) {
              dd = '0' + dd;
            }
            if (mm < 10) {
              mm = '0' + mm;
            }
            today = dd + '.' + mm + '.' + yyyy;
            const todayFileName = yyyy + '-' + mm + '-' + dd;

            if (canvas.toBlob) {
              canvas.toBlob(
                function (blob) {
                  const doc = new JSPDF({
                    orientation: pageOrientation,
                    unit: 'px',
                    format: 'a4'
                  });

                  const pdfWidth = doc.internal.pageSize.width;
                  const pdfHeight = doc.internal.pageSize.height;

                  let maxWidth;
                  let maxHeight;

                  const pdfLeftMargin = 20;
                  const pdfRightMargin = 20;
                  const pdfTopMargin = 40;
                  const pdfBottomMargin = 20;

                  if (ratio > 1) {
                    // portrait
                    maxWidth = pdfWidth - pdfLeftMargin - pdfRightMargin;
                    maxHeight = pdfHeight - pdfTopMargin - pdfBottomMargin;
                  } else {
                    maxWidth = pdfWidth - pdfLeftMargin - pdfRightMargin;
                    maxHeight = pdfHeight - pdfTopMargin - pdfBottomMargin;
                  }
                  const pdfMapWidth = pdfWidth - (pdfLeftMargin + pdfRightMargin);
                  const titleXPos = pdfMapWidth / 2.4;
                  const titleYPos = 25;

                  doc.setFont('Arial');

                  doc.setFontSize(22);

                  doc.text('TU Campus', titleXPos, titleYPos);
                  doc.setFontSize(12);

                  const x = MapUtil.calculateAspectRatioFit(canvasMapWidth, canvasMapHeight, maxWidth,
                    maxHeight);

                  const reader = new window.FileReader();
                  reader.readAsDataURL(blob);
                  reader.onloadend = function () {
                    const base64data = reader.result;
                    if (ratio > 1) {
                      const pdfLeftMargin = (pdfWidth - x.width) / 2;
                      doc.text('Stockwerk:  ' + activeFloorName, 208, titleYPos + 10);
                      doc.addImage(base64data, 'PNG', pdfLeftMargin, 40, x.width, x
                        .height);
                      doc.text(today, 20, 617);
                    } else {
                      const pdfLeftMargin = (pdfWidth - x.width) / 2;
                      doc.text('Stockwerk:  ' + activeFloorName, 300, titleYPos + 10);
                      doc.addImage(base64data, 'PNG', pdfLeftMargin, 40, x.width, x
                        .height);
                      doc.text(today, 20, 420);
                    }
                    doc.save(todayFileName + '-TU.pdf')
                  }
                },
                'image/jpeg'
              );
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
