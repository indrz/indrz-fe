<template>
  <div>
    <div :id="mapId" class="fill-height fluid flat width='100%' style='border-radius: 0" />
    <div id="zoom-control" class="indrz-zoom-control" />
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
      map: null
    };
  },
  mounted () {
    // eslint-disable-next-line no-new
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
      layers: MapUtil.getLayers()
    });
  }
};
</script>

<style scoped>
.indrz-zoom-control {
  right: 50px !important;
  bottom: 90px !important;
  position: absolute;
  z-index: 102;
}
</style>
