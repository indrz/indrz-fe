<template>
  <div>
    <div id="map" class="map">
      <pre id="info" />
    </div>

    <div id="mouse-position" />
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
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import MousePosition from 'ol/control/MousePosition';
import { get as getProjection } from 'ol/proj';
import { createStringXY } from 'ol/coordinate';
import { defaults as defaultControls } from 'ol/control';
import TileGrid from 'ol/tilegrid/WMTS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

const createWmtsLayer = function (layerSrcName, type, isVisible, sourceName) {
  const sm = getProjection('EPSG:3857');
  const templatepng =
    '{Layer}/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}' +
    type;
  const urlsbmappng = [
    'https://maps1.wien.gv.at/basemap/' + templatepng,
    'https://maps2.wien.gv.at/basemap/' + templatepng,
    'https://maps3.wien.gv.at/basemap/' + templatepng,
    'https://maps4.wien.gv.at/basemap/' + templatepng
  ];
  const tilegrid = new TileGrid({
    origin: [-20037508.3428, 20037508.3428],
    extent: [977650, 5838030, 1913530, 6281290],
    resolutions: [
      156543.03392811998,
      78271.51696419998,
      39135.758481959994,
      19567.879241008,
      9783.939620504,
      4891.969810252,
      2445.984905126,
      1222.9924525644,
      611.4962262807999,
      305.74811314039994,
      152.87405657047998,
      76.43702828523999,
      38.21851414248,
      19.109257071295996,
      9.554628535647998,
      4.777314267823999,
      2.3886571339119995,
      1.1943285669559998,
      0.5971642834779999,
      0.29858214174039993,
      0.14929107086936
    ],
    matrixIds: [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20'
    ]
  });

  const WmtsTileSource = new WMTS({
    tilePixelRatio: 1,
    projection: sm,
    layer: layerSrcName,
    style: 'normal',
    matrixSet: 'google3857',
    urls: urlsbmappng,
    crossOrigin: 'anonymous',
    requestEncoding: /** @type {ol.source.WMTSRequestEncoding} */ ('REST'),
    tileGrid: tilegrid,
    attributions:
      '<a href="https://www.basemap.at/' + '" style="font-size: 10pt;">© Basemap.at</a>'
  });

  const wmtsLayer = new TileLayer({
    name: layerSrcName,
    source: WmtsTileSource,
    minResolution: 0.298582141738,
    visible: isVisible,
    type: 'background'
  });
  return wmtsLayer;
}

const greyBmapat = createWmtsLayer(
  'bmapgrau',
  '.png',
  true,
  'basemap.at'
);

export default {
  name: 'BaseMap',
  data () {
    return {
      map: null,
      center: [1822279.3104, 6139940.224], // Adjust center as needed
      zoom: 18,
      layers: {},
      activeLayers: []
    };
  },
  mounted () {
    this.initMap();
  },
  methods: {
    initMap () {
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
          greyBmapat
        ],
        view: new View({
          projection: 'EPSG:3857',
          center: this.center,
          zoom: this.zoom
        })
      });

      const projectionSelect = document.getElementById('projection');
      projectionSelect.addEventListener('change', function (event) {
        mousePositionControl.setProjection(event.target.value);
      });

      const precisionInput = document.getElementById('precision');
      precisionInput.addEventListener('change', function (event) {
        const format = createStringXY(event.target.valueAsNumber);
        mousePositionControl.setCoordinateFormat(format);
      });
    },

    addLayer (layerName, color, geojsonData) {
      const defaultStyle = new Style({
        fill: new Fill({
          color: color
        }),
        stroke: new Stroke({
          color: '#575757',
          width: 1
        })
      });

      if (!this.layers[layerName]) {
        const vectorLayer = new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures(geojsonData, {
              dataProjection: 'EPSG:3857',
              featureProjection: 'EPSG:3857'
            })
          }),
          style: defaultStyle
        });
        this.layers[layerName] = vectorLayer;
        this.map.addLayer(vectorLayer);
      }
    },
    removeLayer (layerName) {
      const layer = this.layers[layerName];
      if (layer) {
        this.map.removeLayer(layer);
        delete this.layers[layerName];
      }
    }
  }
};
</script>

<style>
#map {
  width: 100%;
  height: 900px;
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
