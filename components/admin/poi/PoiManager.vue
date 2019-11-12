<template>
  <div class="fill-height">
    <div :id="mapId" class="fill-height fluid flat width='100%' style='border-radius: 0" />
  </div>
</template>

<script>
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { defaults as defaultInteraction } from 'ol/interaction';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import PinchZoom from 'ol/interaction/PinchZoom';
import MapUtil from '~/util/map';

export default {
  name: 'PoiManager',
  data () {
    return {
      mapId: 'mapContainer',
      map: null,
      view: null,
      layers: [],
      activeFloorName: '',
      initialFloor: {}
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
    // this.map.on('singleclick', this.onMapClick, this);
    window.onresize = () => {
      setTimeout(() => {
        this.map.updateSize();
      }, 500);
    };
  }
}
</script>

<style scoped>

</style>
