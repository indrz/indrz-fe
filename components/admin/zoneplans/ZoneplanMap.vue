<template>
  <div>
    <div id="map" class="map">
      <pre id="info"/>
    </div>

    <div id="mouse-position"/>
    <form>
      <label for="projection">Projection </label>
      <select id="projection">
        <option value="EPSG:4326">
          EPSG:4326
        </option>
        <option value="EPSG:3857">
          EPSG:3857
        </option>
      </select>
      <label for="precision">Precision</label>
      <input id="precision" type="number" min="0" max="12" value="4">
    </form>
  </div>
</template>

<script>
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import MousePosition from 'ol/control/MousePosition';

import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';

import { createStringXY } from 'ol/coordinate';
import { defaults as defaultControls } from 'ol/control';

import { Fill, Stroke, Style } from 'ol/style';

export default {
  name: 'ZoneplanMap',
  data () {
    return {
      map: null,
      center: [1822279.3104, 6139940.224], // Adjust center as needed
      zoom: 18
    };
  },
  mounted () {
    this.initMap();
  },
  methods: {
    initMap () {
      const zonestyle = new Style({
        stroke: new Stroke({
          color: 'gray',
          width: 1
        }),
        fill: new Fill({
          color: 'rgba(20,20,20,0.9)'
        })
      });

      const mousePositionControl = new MousePosition({
        coordinateFormat: createStringXY(4),
        projection: 'EPSG:3857',
        // comment the following two lines to have the mouse position
        // be placed within the map.
        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position')
      });

      this.map = new Map({
        controls: defaultControls().extend([mousePositionControl]),
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          projection: 'EPSG:3857',
          center: this.center,
          zoom: this.zoom
        })
      });

      // Add the vector tiles layer
      const vectorTileLayer = new VectorTileLayer({
        declutter: true,
        source: new VectorTileSource({
          format: new MVT(),
          url: 'http://localhost/geoserver/gwc/service/tms/1.0.0/indrz:zoneplan@EPSG:900913@pbf/{z}/{x}/{y}.pbf' // Adjust URL as needed
        }),
        style: zonestyle
      });

      this.map.addLayer(vectorTileLayer);

      const projectionSelect = document.getElementById('projection');
      projectionSelect.addEventListener('change', function (event) {
        mousePositionControl.setProjection(event.target.value);
      });

      const precisionInput = document.getElementById('precision');
      precisionInput.addEventListener('change', function (event) {
        const format = createStringXY(event.target.valueAsNumber);
        mousePositionControl.setCoordinateFormat(format);
      });
    }
  }
};
</script>

<style>
#map {
  width: 100%;
  height: 500px;
}
#info {
  z-index: 1;
  opacity: 0;
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 0;
  background: rgba(0, 60, 136, 0.7);
  color: white;
  border: 0;
  transition: opacity 100ms ease-in;
}
</style>
