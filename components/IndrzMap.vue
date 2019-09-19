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
    <info-overlay @closeClick="closeIndrzPopup" />
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
// import {toStringHDMS} from 'ol/coordinate';
// import {transform} from 'ol/proj'
import MapUtil from '../util/map';
import InfoOverlay from '../components/infoOverlay'
import 'ol/ol.css';

export default {
  components: {
    InfoOverlay
  },
  data () {
    return {
      mapId: 'mapContainer',
      map: null,
      view: null,
      isSatelliteMap: true,
      layers: [],
      popup: null,
      activeFloorNum: 0,
      globalPopupInfo: {},
      objCenterCoords: '',
      popUpHomePage: '',
      currentPOIID: 0,
      currentLocale: 'en',
      routeToValTemp: '',
      routeFromValTemp: '',
      hostUrl: window.location.href
    };
  },

  mounted () {
    // eslint-disable-next-line no-new
    this.layers = MapUtil.getLayers();
    this.view = new View({
      center: MapUtil.getStartCenter(),
      zoom: 17,
      maxZoom: 23
    });
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
    closeIndrzPopup () {
      this.popup.setPosition(undefined);
    },
    openIndrzPopup (properties, coordinate, feature, offsetArray) {
      const popupContent = document.getElementById('popup-content');
      for (const member in this.globalPopupInfo) {
        this.globalPopupInfo[member] = null
      }
      feature = (typeof feature !== 'undefined' && feature !== null) ? feature : -1;
      offsetArray = typeof offsetArray !== 'undefined' ? offsetArray : [0, 0];

      if (properties.hasOwnProperty('poiId')) {
        this.globalPopupInfo.src = 'poi';
        this.globalPopupInfo.poiId = properties.poiId;
      }
      if (properties.hasOwnProperty('fk_poi_category')) {
        this.globalPopupInfo.src = 'poi';
        this.globalPopupInfo.poiCatId = properties.fk_poi_category.id;
      }
      if (properties.hasOwnProperty('spaceid')) {
        this.globalPopupInfo.spaceid = properties.spaceid
      }
      if (properties.hasOwnProperty('homepage')) {
        if (properties.homepage) {
          this.popUpHomePage = properties.homepage
        }
      }
      if (properties.hasOwnProperty('src')) {
        if (properties.src) {
          this.globalPopupInfo.src = properties.src
        }
      }
      if (properties.hasOwnProperty('space_type_id')) {
        if (properties.hasOwnProperty('src')) {
          if (properties.src) {
            this.globalPopupInfo.src = properties.src
          } else {
            this.globalPopupInfo.src = 'wms'
          }
        }
        if (properties.hasOwnProperty('id')) {
          this.globalPopupInfo.spaceid = properties.id
        }
        if (properties.hasOwnProperty('room_external_id')) {
          if (properties.room_external_id) {
            this.globalPopupInfo.external_id = properties.room_external_id
          }
        }
      }
      if (properties.hasOwnProperty('room_code')) {
        this.globalPopupInfo.wmsInfo = properties.room_code
        properties.roomcode = properties.room_code
      }
      if (properties.hasOwnProperty('poi_id')) {
        this.currentPOIID = properties.poi_id;
        this.globalPopupInfo.poiId = properties.poi_id;
        if (properties.hasOwnProperty('fk_poi_category')) {
          this.globalPopupInfo.poiCatId = properties.fk_poi_category.id;
          if (this.currentLocale === 'de') {
            this.globalPopupInfo.poiCatName = properties.fk_poi_category.cat_name_de;
          } else {
            this.globalPopupInfo.poiCatName = properties.fk_poi_category.cat_name_en;
          }
          // this.globalPopupInfo.poiCatName = properties.fk_poi_category.cat_name;
          this.globalPopupInfo.poiCatShareUrl = this.hostUrl + '?poi-cat-id=' + this.globalPopupInfo.poiCatId;
        }
      } else if (feature !== -1) {
        if (this.globalPopupInfo.poiId === 'noid') {
          if (typeof feature !== 'string' && feature.getId()) {
            this.globalPopupInfo.poiId = feature.getId();
            this.globalPopupInfo.poiIdPopup = feature.getId();
            if (feature.get('fk_poi_category')) {
              this.globalPopupInfo.poiCatId = feature.get('fk_poi_category').id;
              if (this.currentLocale === 'de') {
                this.globalPopupInfo.poiCatName = feature.get('fk_poi_category').cat_name_de;
              } else {
                this.globalPopupInfo.poiCatName = feature.get('fk_poi_category').cat_name_en;
              }
              this.globalPopupInfo.poiCatShareUrl = this.hostUrl + '?poi-cat-id=' + this.globalPopupInfo.poiCatId;
            }
          }
        }
      }
      if (this.globalPopupInfo.poiId !== 'noid') {
        this.globalPopupInfo.poiCatShareUrl = 'poi-cat-id=' + this.globalPopupInfo.poiCatId;
      }
      this.objCenterCoords = coordinate;
      if (this.objCenterCoords || this.objCenterCoords !== '') {
        this.objCenterCoords = coordinate
      } else {
        this.objCenterCoords = properties.centerGeometry.coordinates;
      }
      let titlePopup = '';
      const titleBuildingName = 'Building: ';
      const titleFloorNumber = 'Floor Number: ';
      const titleRoomcode = 'Room Number: ';
      const titleRoomCat = 'Category: ';
      const buildingName = this.getBuildingLetter(properties);
      let roomCode = null;
      let roomCat = null;
      if (properties.hasOwnProperty('category_de')) {
        if (properties.category_de) {
          if (this.currentLocale === 'de') {
            roomCat = properties.category_de;
          } else {
            roomCat = properties.category_en;
          }
        }
      }
      if (properties.hasOwnProperty('room_description')) {
        properties.name = properties.room_description;
      } else if (properties.hasOwnProperty('short_name')) {
        properties.name = properties.short_name;
      }
      if (properties.hasOwnProperty('room_code')) {
        properties.roomcode = properties.room_code;
      }
      titlePopup = this.getTitle(properties);
      this.routeToValTemp = titlePopup;
      // TODO fix this property
      if (properties.hasOwnProperty('centroid') === true) {
        this.routeToValTemp = properties.centroid;
      }
      // const hdms = toStringHDMS(transform(coordinate, 'EPSG:3857', 'EPSG:4326'));
      if (typeof properties.label !== 'undefined') {
        this.activeFloorNum = properties.floor_num;
        roomCode = properties.roomcode;
      } else {
        this.activeFloorNum = properties.floor_num;
        roomCode = properties.roomcode;
      }
      const tb = '<table id="popupTable" style="user-select: text;"></table>';
      popupContent.innerHTML = '<h4 style="user-select: text;">' + titlePopup + '</h4>';
      popupContent.innerHTML += '<div><p>';
      popupContent.innerHTML += tb;

      if (properties.hasOwnProperty('campus_name')) {
        // $('#popup-links').hide();
      } else {
        // $('#popup-links').show();
        if (typeof properties.building_name !== 'undefined' && properties.building_name !== '') {
          this.addPoiTableRow(titleBuildingName, buildingName, 'popupBuilding');
        }
        if (properties.hasOwnProperty('shelfID')) {
          this.addPoiTableRow(titleBuildingName, properties.building, 'popupBuilding');
        }
        if (roomCode) {
          this.addPoiTableRow(titleRoomcode, roomCode, 'popupRoomCode');
        }
        if (roomCat) {
          this.addPoiTableRow(titleRoomCat, roomCat, 'popupRoomCat');
        }
        if (properties.room_external_id) {
          this.addPoiTableRow('Room Code', properties.room_external_id, 'popupSpaceAks');
        }
        this.addPoiTableRow(titleFloorNumber, this.activeFloorNum, 'popupFloorNumber');
      }
      if (this.globalPopupInfo.roomcode) {
        this.routeFromValTemp = this.globalPopupInfo.roomcode;
      } else if (roomCode) {
        this.routeFromValTemp = roomCode
      } else if (this.globalPopupInfo.name) {
        this.routeFromValTemp = this.globalPopupInfo.name;
      } else if (titlePopup) {
        this.routeFromValTemp = titlePopup;
      }
      popupContent.innerHTML += '</p></div>';
      this.globalPopupInfo.name = titlePopup;
      this.globalPopupInfo.coords = this.objCenterCoords;
      this.globalPopupInfo.floor = this.activeFloorNum;
      this.globalPopupInfo.roomcode = roomCode;
      this.popup.setPosition(coordinate);
      this.popup.setOffset(offsetArray);
    },
    getTitle (properties) {
      let name = '';
      let popUpRoomCode = '';

      if (properties.hasOwnProperty('room_code')) {
        if (properties.room_code) {
          popUpRoomCode = properties.room_code;
          name = properties.room_code;
        }
      }
      if (properties.hasOwnProperty('name')) {
        if (properties.name) {
          name = properties.name;
          return name
        }
      }
      if (properties.hasOwnProperty('name_de')) {
        if (properties.name_de) {
          if (this.currentLocale === 'de') {
            name = properties.name_de;
            return name
          } else {
            name = properties.name;
            return name
          }
        }
      }
      if (properties.hasOwnProperty('short_name')) {
        if (properties.short_name) {
          name = properties.short_name;
          return name
        } else if (popUpRoomCode) {
          name = popUpRoomCode;
          return name
        }
      }
      if (properties.hasOwnProperty('label')) {
        if (properties.label) {
          name = properties.label;
          return name;
        } else if (popUpRoomCode) {
          name = popUpRoomCode;
          return name
        }
      }
      if (properties.hasOwnProperty('key')) {
        if (properties.key) {
          name = properties.key;
          return name;
        } else if (popUpRoomCode) {
          name = popUpRoomCode;
          return name
        }
      }
      if (properties.hasOwnProperty('campus_name')) {
        if (properties.campus_name) {
          name = properties.campus_name;
          return name;
        } else if (popUpRoomCode) {
          name = popUpRoomCode;
          return name
        }
      }
      if (properties.hasOwnProperty('room_external_id')) {
        if (properties.room_external_id) {
          if (!name) {
            name = properties.room_external_id;
            return name;
          }
        }
      }
      if (properties.room_code) {
        name = properties.room_code;
        return name;
      } else {
        return name;
      }
    },
    getBuildingLetter (p) {
      let buildingLetter;
      if (p.hasOwnProperty('roomcode')) {
        if (p.roomcode) {
          buildingLetter = p.roomcode.split('.')[0];
          return buildingLetter
        }
      } else if (p.hasOwnProperty('building_name')) {
        if (p.building_name !== null || p.building_name !== '' || typeof p.building_name !== 'undefined') {
          buildingLetter = p.building_name;
          return buildingLetter;
        }
      }
      return '';
    },
    addPoiTableRow (row1, row2, idname) {
      const table = document.getElementById('popupTable');

      if (idname === 'popupHomepage') {
        row2 = '<a target="_blank" href="' + row2 + '">' + row2 + '</a>';
      }

      const row = table.insertRow(0);
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);

      cell1.innerHTML = row1;
      cell2.innerHTML = row2;

      cell1.setAttribute('class', 'no-wrap');
      cell2.setAttribute('id', idname);
    },
    getRoomInfo (floor) {
      const availableWmsLayers = this.layers.switchableLayers;
      let newel;

      availableWmsLayers.forEach(function (element) {
        if (floor === Number(element.getProperties().floor_num)) {
          newel = element.getSource();
        }
      });
      return newel;
    },
    activateFloor (feature) {
      let floor = feature.getProperties().floor_num;
      for (let i = 0; i < this.layers.switchableLayers.length; i++) {
        if (typeof floor === 'number') {
          floor = floor.toString();
        }
        if (floor === this.layers.switchableLayers[i].getProperties().floor_num) {
          this.activateLayer(i);
        }
      }
    },
    onMapClick (evt) {
      /*
      const { pixel } = evt;
      const coordinate = this.map.getCoordinateFromPixel(pixel);
      this.popup.setPosition(coordinate);
      */
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
          this.closeIndrzPopup();
          if (featureType === 'MultiPoint') {
            properties.poiId = feature.getId();
            properties.src = 'poi';
          }
          this.openIndrzPopup(properties, coordinate, feature);
          this.activateFloor(feature);
        } else if (featureType === 'Point') {
          this.closeIndrzPopup();
          coordinate = this.map.getCoordinateFromPixel(pixel);
          properties.src = 'poi';
          if (feature.getProperties().hasOwnProperty('poi_id')) {
            properties.poiId = feature.properties.poi_id;
          }
          this.openIndrzPopup(properties, coordinate, feature);
          this.activateFloor(feature);
        }
      } else {
        const featuresWms = this.map.getFeaturesAtPixel(pixel);
        const v = this.map.getView();
        const viewResolution = /** @type {number} */ (v.getResolution());
        const wmsSource2 = this.getRoomInfo(this.activeFloorNum);
        const url = wmsSource2.getGetFeatureInfoUrl(coordinate, viewResolution, 'EPSG:3857', {
          'INFO_FORMAT': 'application/json',
          'FEATURE_COUNT': 50
        });

        if (url) {
          axios.get(url).then((response) => {
            this.globalPopupInfo.src = 'wms';
            const listFeatures = response.data.features
            const dataProperties = {};

            if (listFeatures.length > 0) {
              listFeatures.forEach(function (feature) {
                if (feature.properties.hasOwnProperty('space_type_id')) {
                  if (feature.properties.hasOwnProperty('room_code') || feature.properties.hasOwnProperty('roomcode')) {
                    const centroidSource = new Vector({
                      features: (new GeoJSON()).readFeatures(feature)
                    });
                    const centroidCoords = getCenter(centroidSource.getExtent());
                    dataProperties.properties = feature.properties;
                    dataProperties.centroid = centroidCoords;
                  }
                }
              });
              dataProperties.properties.src = 'wms';
              debugger;
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
        default:
          break;
      }
    },
    onLocationClick (centroid) {
      this.view.animate({
        center: centroid.coordinates,
        duration: 2000,
        zoom: 17
      });
    },
    onFloorClick (floor) {
      this.activeFloorNum = floor.floor_num;
      MapUtil.activateLayer(floor.floor_num, this.layers.switchableLayers);
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
