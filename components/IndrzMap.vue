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
    <info-overlay @closeClick="onPopupCloseClick" />
  </div>
</template>

<script>
import { saveAs } from 'file-saver';
import Overlay from 'ol/Overlay';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { defaults as defaultInteraction } from 'ol/interaction';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import PinchZoom from 'ol/interaction/PinchZoom';
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
      popup: null
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
    onPopupCloseClick () {
      this.popup.setPosition(undefined);
    },
    onMapClick (evt) {
      const { pixel } = evt;
      const coordinate = this.map.getCoordinateFromPixel(pixel);
      this.popup.setPosition(coordinate);
      /*
      const pixel = evt.pixel;
      let feature = this.map.getFeaturesAtPixel(pixel);
      const features = [];

      this.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
        features.push(feature);
      });
      feature = features[0];
      debugger;
      let coordinate = this.map.getCoordinateFromPixel(pixel);
      const properties = feature ? feature.getProperties() : null;
      if (feature) {
        const featureType = feature.getGeometry().getType().toString();

        if (featureType === 'MultiPolygon' || featureType === 'MultiPoint') {
          closeIndrzPopup();
          if (featureType === 'MultiPoint') {
            properties.poiId = feature.getId();
            properties.src = 'poi';
          }
          open_popup(properties, coordinate, feature);
          activateFloor(feature);
        } else if (feature.getGeometry().getType() === 'Point') {
          closeIndrzPopup();
          coordinate = this.map.getCoordinateFromPixel(pixel);
          properties.src = 'poi';
          if (feature.getProperties().hasOwnProperty('poi_id')) {
            properties.poiId = feature.properties.poi_id
          }
          open_popup(properties, coordinate, feature);
          activateFloor(feature);
        }
      } else {
        debugger;
        const featuresWms = this.map.getFeaturesAtPixel(pixel);
        const v = this.map.getView();
        const viewResolution = /!** @type {number} *!/ (v.getResolution());

        const wmsSource2 = getRoomInfo(active_floor_num)

        const url = wmsSource2.getGetFeatureInfoUrl(coordinate, viewResolution, 'EPSG:3857', {
          'INFO_FORMAT': 'application/json',
          'FEATURE_COUNT': 50
        });

        if (url) {
          $.ajax(url).then(function (response) {
            globalPopupInfo.src = 'wms'
            const listFeatures = response.features
            const propertiesPresent = response.features && response.features[0] && response.features[0].properties
            const data_properties = {}

            if (listFeatures.length > 0) {
              listFeatures.forEach(function (feature) {
                if (feature.properties.hasOwnProperty('space_type_id')) {
                  if (feature.properties.hasOwnProperty('room_code') || feature.properties.hasOwnProperty('roomcode')) {
                    const centroidSource = new ol.source.Vector({
                      features: (new ol.format.GeoJSON()).readFeatures(feature)
                    });
                    const centroid_coords = ol.extent.getCenter(centroidSource.getExtent())
                    data_properties.properties = feature.properties;
                    data_properties.centroid = centroid_coords;
                  }
                }
              });
              data_properties.properties.src = 'wms'
              open_popup(data_properties.properties, data_properties.centroid, featuresWms)
            }
          });
        }
      }
      */
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
