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
    <v-dialog
      v-model="deleteConfirm"
      persistent
      max-width="350"
    >
      <v-card>
        <v-card-title>Are you sure you want to delete?</v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error darken-1" text @click="onDeletePoiClick">
            Yes
          </v-btn>
          <v-btn color="blue darken-1" text @click="deleteConfirm = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from 'ol/style';
import { Draw, Modify, Snap, defaults as defaultInteraction, Translate } from 'ol/interaction';
import { Point } from 'ol/geom';
import { Feature, Collection } from 'ol';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import PinchZoom from 'ol/interaction/PinchZoom';
import POIHandler from '../../../util/POIHandler';
import MapStyles from '../../../util/mapStyles';
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
      isSatelliteMap: true,
      vectorInteractionLayer: null,
      isAddPoiMode: false,
      currentEditingPoi: null,
      modify: null,
      selectedPoi: null,
      deleteConfirm: false
    };
  },
  async mounted () {
    await this.initializeMap();
    this.initializeEventHandlers();
  },
  methods: {
    initializeEventHandlers () {
      this.$root.$on('addPoiClick', this.addInteractions);
      this.$root.$on('editPoiClick', this.editInteraction);
      this.$root.$on('deletePoiClick', this.confirmDeletePoi);
      this.$root.$on('cancelPoiClick', this.removeInteraction)
    },
    async initializeMap () {
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
    onMapClick (evt) {
      const pixel = evt.pixel;
      let feature = this.map.getFeaturesAtPixel(pixel);
      const features = [];

      this.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
        features.push(feature);
      });
      feature = features[0];

      if (feature) {
        const featureType = feature.getGeometry().getType().toString();

        if (featureType === 'MultiPolygon' || featureType === 'MultiPoint') {
          if (featureType === 'MultiPoint') {
            this.activeFloorName = indrzConfig.layerNamePrefix + this.activeFloor.short_name.toLowerCase();
            let onActiveLayer = true;
            if (indrzConfig.layerNamePrefix + (feature.getProperties().floor_name).toLowerCase() !== this.activeFloorName) {
              onActiveLayer = false;
            }
            feature.setStyle(MapStyles.setPoiStyleOnLayerSwitch('/images/selected.png', onActiveLayer));
            this.clearPreviousSelection();
            this.selectedPoi = feature;
          }
        }
      }
    },
    clearPreviousSelection () {
      let onActiveLayer = true;
      this.activeFloorName = indrzConfig.layerNamePrefix + this.activeFloor.short_name.toLowerCase();

      if (this.selectedPoi) {
        if (indrzConfig.layerNamePrefix + (this.selectedPoi.getProperties().floor_name).toLowerCase() !== this.activeFloorName) {
          onActiveLayer = false;
        }
        this.selectedPoi.setStyle(MapStyles.setPoiStyleOnLayerSwitch(this.selectedPoi.getProperties().icon, onActiveLayer));
      }
    },
    confirmDeletePoi () {
      if (!this.selectedPoi || !this.selectedPoi.getId()) {
        this.$store.commit('SET_SNACKBAR', 'Please select the POI first to delete.');
        return;
      }
      this.deleteConfirm = true;
    },
    onDeletePoiClick () {
      this.$root.$emit('deletePoi', this.selectedPoi);
      this.selectedPoi = null;
      this.deleteConfirm = false;
    },
    editInteraction () {
      if (!this.selectedPoi) {
        return;
      }
      this.clearPreviousSelection();
      const coord = this.selectedPoi.getGeometry().getCoordinates()[0];
      this.selectedPoi.setStyle(MapStyles.setPoiStyleOnLayerSwitch('', true));
      this.selectedPoi.setStyle(MapStyles.setPoiStyleOnLayerSwitch(null, true));
      const styleMarker = new Style({
        image: new Icon({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          opacity: 1,
          src: '/images/selected_pin.png'
        })
      });

      this.editMarker = new Point(coord);
      const featureMarker = new Feature(this.editMarker);
      this.editingVectorLayer = new VectorLayer({
        zIndex: 35,
        source: new VectorSource({
          features: [featureMarker]
        }),
        style: [styleMarker]
      });
      this.map.addLayer(this.editingVectorLayer);

      this.translate = new Translate({
        features: new Collection([featureMarker])
      });
      this.map.addInteraction(this.translate);
      this.translate.on('translateend', this.onTranslateEnd);
    },
    addInteractions () {
      this.clearPreviousSelection();
      this.selectedPoi = null;
      if (!this.activeFloorName || !this.selectedPoiCategory) {
        this.$store.commit('SET_SNACKBAR', 'Please select the POI category and Active floor to continue');
        return;
      }
      this.isAddPoiMode = true;
      this.source = new VectorSource();
      this.vectorInteractionLayer = new VectorLayer({
        source: this.source,
        zIndex: 35,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new Stroke({
            color: '#ffcc33',
            width: 2
          }),
          image: new Icon({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '/images/selected_pin.png'
          }),
          image1: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: '#ffcc33'
            })
          })
        })
      });
      this.modify = new Modify({ source: this.source });
      this.map.addInteraction(this.modify);
      this.map.addLayer(this.vectorInteractionLayer);
      this.draw = new Draw({
        source: this.source,
        type: 'Point'
      });
      this.map.addInteraction(this.draw);
      this.snap = new Snap({ source: this.source });
      this.map.addInteraction(this.snap);
      this.draw.on('drawend', this.onDrawEnd);
      this.modify.on('modifyend', this.onModifyEnd);
      this.modify.on('modifystart', this.onModifyStart);
    },
    onTranslateEnd (e) {
      this.$emit('editPoi', {
        feature: this.selectedPoi,
        coord: this.editMarker.getCoordinates()
      });
    },
    onModifyStart (e) {
      this.currentEditingPoi = {
        oldCoord: e.target.dragSegments_[0][0].feature.getGeometry().getCoordinates()
      };
    },
    onModifyEnd (e) {
      if (this.currentEditingPoi) {
        this.currentEditingPoi.newCoord = e.target.dragSegments_[0][0].feature.getGeometry().getCoordinates();
        this.$emit('updatePoiCoord', this.currentEditingPoi);
      }
    },
    removeInteraction () {
      this.isAddPoiMode = false;
      this.map.removeInteraction(this.draw);
      this.map.removeInteraction(this.snap);
      this.map.removeInteraction(this.translate);
      if (this.vectorInteractionLayer) {
        this.map.removeLayer(this.vectorInteractionLayer);
      }
      if (this.editingVectorLayer) {
        this.map.removeLayer(this.editingVectorLayer);
      }
      if (this.draw) {
        this.draw.un('drawend', this.onDrawEnd)
      }
      if (this.modify) {
        this.modify.un('modifyend', this.onModifyEnd)
      }
      if (this.modify) {
        this.modify.un('modifystart', this.onModifyStart)
      }
      if (this.translate) {
        this.translate.un('translateend')
      }
      this.clearPreviousSelection();
      this.selectedPoi = null;
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
    onDrawEnd (drawEvent) {
      if (!this.isAddPoiMode) {
        return;
      }
      const coordinate = drawEvent.feature.getGeometry().getCoordinates();
      const data = {
        'floor': 1,
        'name': this.selectedPoiCategory.name,
        'description': '',
        'enabled': true,
        'name_en': this.selectedPoiCategory.name_en,
        'name_de': this.selectedPoiCategory.name_de,
        'floor_num': this.activeFloor.floor_num,
        'floor_name': this.activeFloor.short_name,
        'category': this.selectedPoiCategory.id,
        'geom': JSON.stringify({
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
        })
      };
      this.$emit('addnewPoi', data);
    },
    onPoiLoad ({ removedItems, newItems, oldItems }) {
      if (removedItems && removedItems.length) {
        removedItems.forEach((item) => {
          if (POIHandler.poiExist(item, this.map)) {
            POIHandler.removePoiById(item.id, this.map);
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
          this.activeFloorName = indrzConfig.layerNamePrefix + this.activeFloor.short_name.toLowerCase();
          POIHandler
            .fetchPoi(item.id, this.map, this.activeFloorName)
            .then((poiLayer) => {
              this.map.getLayers().forEach((layer) => {
                if (layer.getProperties().id === 99999) {
                  layer.getLayers().push(poiLayer);
                }
              });
            });
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
