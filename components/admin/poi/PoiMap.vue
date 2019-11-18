<template>
  <div>
    <div :id="mapId" :ref="map" class="fill-height fluid flat width='100%' style='border-radius: 0" />
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
    <div class="tu-logo">
      <a href="https://www.tuwien.at" target="_blank">
        <img id="tu-logo" src="/images/tu-logo.png" alt="tulogo" style="width:auto; height:40px; ">
      </a>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Vector from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { getCenter } from 'ol/extent';
import { defaults as defaultInteraction } from 'ol/interaction';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import PinchZoom from 'ol/interaction/PinchZoom';
import POIHandler from '../../../util/POIHandler';
import indrzConfig from '~/util/indrzConfig';
import MapUtil from '~/util/map';
import MapHandler from '~/util/mapHandler';
import api from '~/util/api';
import 'ol/ol.css';
export default {
  name: 'Map',
  data () {
    return {
      mapId: 'mapContainer',
      map: null,
      view: null,
      layers: [],
      isSatelliteMap: true
    };
  },
  async mounted () {
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
    this.map.on('singleclick', this.onMapClick, this);
    window.onresize = () => {
      setTimeout(() => {
        this.map.updateSize();
      }, 500);
    };

    const floorData = await api.request({ endPoint: 'floor/' });

    if (floorData && floorData.data && floorData.data.results) {
      this.floors = floorData.data.results;
      if (this.floors && this.floors.length) {
        this.intitialFloor = this.floors.filter(floor => floor.short_name.toLowerCase() === indrzConfig.defaultStartFloor)[0];
        this.activeFloorName = indrzConfig.layerNamePrefix + this.intitialFloor.short_name.toLowerCase();
        this.$emit('floorChange', {
          floor: this.intitialFloor,
          floors: this.floors,
          name: this.activeFloorName
        });
        this.wmsLayerInfo = MapUtil.getWmsLayers(this.floors);
      }
      this.layers.layerGroups.push(this.wmsLayerInfo.layerGroup);
      this.layers.switchableLayers = this.wmsLayerInfo.layers;
      this.map.addLayer(this.wmsLayerInfo.layerGroup);
    }
  },
  methods: {
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
          if (featureType === 'MultiPoint') {
            properties.poiId = feature.getId();
            properties.src = 'poi';
          }

          // this.openIndrzPopup(properties, coordinate, feature);
          MapUtil.activateFloor(feature, this.layers, this.map);
        } else if (featureType === 'Point') {
          coordinate = this.map.getCoordinateFromPixel(pixel);
          properties.src = 'poi';
          if (feature.getProperties().hasOwnProperty('poi_id')) {
            properties.poiId = feature.properties.poi_id;
          }

          // this.openIndrzPopup(properties, coordinate, feature);
          MapUtil.activateFloor(feature, this.layers, this.map);
        }
      } else {
        // const featuresWms = this.map.getFeaturesAtPixel(pixel);
        const v = this.map.getView();
        const viewResolution = /** @type {number} */ (v.getResolution());
        const wmsSource2 = MapHandler.getRoomInfo(this.activeFloorName, this.layers);
        const url = wmsSource2.getGetFeatureInfoUrl(coordinate, viewResolution, 'EPSG:3857', {
          'INFO_FORMAT': 'application/json',
          'FEATURE_COUNT': 50
        });

        if (url) {
          axios.get(url).then((response) => {
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
              // this.openIndrzPopup(dataProperties.properties, dataProperties.centroid, featuresWms)
            }
          });
        }
      }
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
    }
  }
}
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
