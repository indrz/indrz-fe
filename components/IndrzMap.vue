<template>
  <div>
    <div :id="mapId" class="fill-height fluid flat width='100%' style='border-radius: 0" />
    <div id="zoom-control" class="indrz-zoom-control" />
  </div>
</template>

<script>
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import Group from 'ol/layer/Group';
import { Zoom, Attribution, ScaleLine } from 'ol/control.js';
import { get as getProjection } from 'ol/proj.js';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import WMTS from 'ol/source/WMTS.js';
import TileGrid from 'ol/tilegrid/WMTS';
import { defaults as defaultInteraction } from 'ol/interaction';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import PinchZoom from 'ol/interaction/PinchZoom';
import 'ol/ol.css';

export default {
  data () {
    return {
      mapId: 'mapContainer',
      map: null
    };
  },
  mounted () {
    // controls
    const attributionControl = new Attribution({
      collapsible: false
    });
    const scaleLineControl = new ScaleLine();
    const zoomControl = new Zoom({ target: 'zoom-control' });

    // layers
    const greyBmapat = this.createWmtsLayer(
      'bmapgrau',
      '.png',
      true,
      'basemap.at'
    );
    const ortho30cmBmapat = this.createWmtsLayer(
      'bmaporthofoto30cm',
      '.jpg',
      false,
      'basemap.at'
    );
    const wmsE00 = this.createWmsLayer('e00', 'indrz:e00', '0', 'true', 3);
    const wmsE01 = this.createWmsLayer('e01', 'indrz:e01', '1', 'false', 3);
    const wmsE02 = this.createWmsLayer('e02', 'indrz:e02', '2', 'false', 3);
    const wmsE03 = this.createWmsLayer('e03', 'indrz:e03', '3', 'false', 3);

    // layer group
    const backgroundLayerGroup = new Group({
      layers: [greyBmapat, ortho30cmBmapat],
      name: 'background maps'
    });
    const wmsfloorLayerGroup = new Group({
      layers: [wmsE00, wmsE01, wmsE02, wmsE03],
      name: 'wms floor maps'
    });
    const poiLayerGroup = new Group({
      layers: [],
      id: 99999,
      name: 'poi group'
    });
    const campusLocationsGroup = new Group({
      layers: [],
      id: 900,
      name: 'campus locations'
    });

    // map
    // eslint-disable-next-line no-new
    this.map = new Map({
      interactions: defaultInteraction().extend([
        new DragRotateAndZoom(),
        new PinchZoom({
          constrainResolution: true
        })
      ]),
      target: this.mapId,
      controls: [zoomControl, attributionControl, scaleLineControl],
      view: new View({
        center: [1587942.2647, 5879651.6586],
        zoom: 17,
        maxZoom: 23
      }),
      layers: [
        backgroundLayerGroup,
        wmsfloorLayerGroup,
        poiLayerGroup,
        campusLocationsGroup
      ]
    });
  },
  methods: {
    createWmtsLayer (layerSrcName, type, isVisible, sourceName) {
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
          '© <a href="https://www.basemap.at/' + '">Basemap.at       </a>'
      });

      const wmtsLayer = new TileLayer({
        name: layerSrcName,
        source: WmtsTileSource,
        minResolution: 0.298582141738,
        visible: isVisible,
        type: 'background'
      });
      return wmtsLayer;
    },
    createWmsLayer (
      layerName,
      geoserverLayer,
      floorNumber,
      isVisible,
      zIndexValue
    ) {
      return new ImageLayer({
        source: new ImageWMS({
          url: 'https://campusplan.aau.at/geoserver/' + 'indrz/wms',
          params: { LAYERS: geoserverLayer, TILED: true },
          serverType: 'geoserver',
          crossOrigin: ''
        }),
        visible: isVisible,
        name: layerName,
        floor_num: floorNumber,
        type: 'floor',
        zIndex: zIndexValue,
        crossOrigin: 'anonymous'
      });
    }
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
