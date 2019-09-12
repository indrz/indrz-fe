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
  </div>
</template>

<script>
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { defaults as defaultInteraction } from 'ol/interaction';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import PinchZoom from 'ol/interaction/PinchZoom';
import MapUtil from '../util/map';
import 'ol/ol.css';

export default {
  data () {
    return {
      mapId: 'mapContainer',
      map: null,
      isSatelliteMap: true,
      layers: []
    };
  },

  mounted () {
    // eslint-disable-next-line no-new
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
      view: new View({
        center: [1587942.2647, 5879651.6586],
        zoom: 17,
        maxZoom: 23
      }),
      layers: this.layers.layerGroups
    });
    window.onresize = () => {
      setTimeout(() => {
        this.map.updateSize();
      }, 500);
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
    }
  }
};
</script>

<style scoped>
.indrz-zoom-control {
  right: 50px !important;
  bottom: 100px !important;
  position: absolute;
  z-index: 102;
}
#id-map-switcher-widget {
  position: absolute;
  right: 45px !important;
  bottom: 37px !important;
}
</style>
