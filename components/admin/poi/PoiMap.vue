<template>
  <div class="fill-height">
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
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Draw, Modify, Snap, defaults as defaultInteraction } from 'ol/interaction';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import PinchZoom from 'ol/interaction/PinchZoom';
import POIHandler from '../../../util/POIHandler';
import indrzConfig from '~/util/indrzConfig';
import MapUtil from '~/util/map';
import api from '~/util/api';
import 'ol/ol.css';
export default {
  name: 'Map',
  props: {
    selectedPoiCategory: {
      type: Object,
      default: function () {
        return null;
      }
    },
    activeFloor: {
      type: Object,
      default: function () {
        return null;
      }
    }
  },
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
    await this.initializeMap();
    this.initializeEventHandlers();
  },
  methods: {
    initializeEventHandlers () {
      this.$root.$on('addPoiClick', this.addInteractions);
      this.$root.$on('cancelPoiClick', this.removeInteraction)
    },
    async initializeMap () {
      this.view = new View({
        center: MapUtil.getStartCenter(),
        zoom: 17,
        maxZoom: 23
      });

      this.layers = MapUtil.getLayers();

      this.raster = new TileLayer({
        source: new OSM()
      });

      this.source = new VectorSource();

      this.vector = new VectorLayer({
        source: this.source,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new Stroke({
            color: '#ffcc33',
            width: 2
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: '#ffcc33'
            })
          })
        })
      });

      this.layers.layerGroups.push(this.vector);
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

      const modify = new Modify({ source: this.source });
      this.map.addInteraction(modify);

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
    addInteractions () {
      if (!this.activeFloorName || !this.selectedPoiCategory) {
        this.$store.commit('SET_SNACKBAR', 'Please select the POI category and Active floor to continue');
        return;
      }
      this.draw = new Draw({
        source: this.source,
        type: 'Point'
      });
      this.map.addInteraction(this.draw);
      this.snap = new Snap({ source: this.source });
      this.map.addInteraction(this.snap);
    },
    removeInteraction () {
      this.map.removeInteraction(this.draw);
      this.map.removeInteraction(this.snap);
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
    onMapClick (evt) {
      const pixel = evt.pixel;
      const coordinate = this.map.getCoordinateFromPixel(pixel);
      const data = {
        'fk_building_floor': 1,
        'fk_campus': 1,
        'fk_building': 1,
        'name': this.selectedPoiCategory.name,
        'description': 'foo',
        'enabled': true,
        'name_en': this.selectedPoiCategory.name_en,
        'name_de': this.selectedPoiCategory.name_de,
        'floor_num': this.activeFloor.floor_num,
        'floor_name': this.activeFloor.short_name,
        'fk_poi_category': this.selectedPoiCategory.id,
        'geom': {
          'type': 'MultiPoint',
          'coordinates': [
            coordinate
          ],
          'crs': {
            'type': 'name',
            'properties': {
              'name': 'EPSG:3857'
            }
          }
        }
      };

      api.postRequest({
        endPoint: `poi/`,
        method: 'POST',
        data
      });
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
