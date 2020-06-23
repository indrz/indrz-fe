<template>
  <div class="fill-height">
    <div :id="mapId" :ref="map" class="fill-height fluid flat width='100%' style='border-radius: 0" />
    <div id="zoom-control" class="indrz-zoom-control" />
    <div id="id-map-switcher-widget">
      <v-btn
        id="id-map-switcher"
        @click="onMapSwitchClick"
        color="rgba(0,60,136,0.5)"
        min-width="95px"
        class="pa-2"
        small
        dark
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
      <a :href=indrzConfig.homepageUrl target="_blank">
        <img id="tu-logo" :src=indrzConfig.leftMenuLogo alt="logo" style="width:auto; height:40px; ">
      </a>
    </div>
    <v-dialog
      v-model="deleteConfirm"
      persistent
      max-width="350"
    >
      <v-card>
        <v-card-title v-if="removePois.length > 1">
          Are you sure you want to delete all {{ removePois.length }} poi's?
        </v-card-title>
        <v-card-title v-if="removePois.length === 1">
          Are you sure you want to delete the selected poi?
        </v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="onDeletePoiClick"
            color="error darken-1"
            text
          >
            Yes
          </v-btn>
          <v-btn
            @click="deleteConfirm = false"
            color="blue darken-1"
            text
          >
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
import { Style, Icon } from 'ol/style';
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
      currentEditingPoi: null,
      modify: null,
      selectedPoi: null,
      removePois: [],
      newPois: [],
      editPois: [],
      deleteConfirm: false,
      currentMode: null,
      mode: {
        add: 'add',
        edit: 'edit',
        remove: 'remove'
      },
      editingVectorLayer: []
    };
  },
  async mounted () {
    await this.initializeMap();
    this.initializeEventHandlers();
  },
  methods: {
    initializeEventHandlers () {
      this.$root.$on('addPoiClick', this.addInteractions);
      this.$root.$on('editPoiClick', () => {
        this.currentMode = this.mode.edit;
      });
      this.$root.$on('deletePoiClick', this.enableDeletePoi);
      this.$root.$on('cancelPoiClick', this.removeInteraction)
    },
    async initializeMap () {
      this.view = new View({
        center: MapUtil.getStartCenter(),
        zoom: 15,
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
          this.intitialFloor = this.floors.filter(floor => floor.short_name.toLowerCase() === indrzConfig.defaultStartFloor.toLowerCase())[0];
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
            this.selectedPoi = feature;
            if (this.currentMode && this.currentMode === this.mode.remove) {
              this.removePois.push(this.selectedPoi);
            } else if (this.currentMode && this.currentMode === this.mode.edit) {
              this.editPois.push(this.selectedPoi);
              this.editInteraction();
            } else {
              this.clearPreviousSelection();
            }
          }
        }
      }
    },
    clearSelection () {
      let onActiveLayer = true;
      let features = [];
      switch (this.currentMode) {
        case 'add':
          features = this.newPois;
          break;
        case 'edit':
          features = this.editPois;
          break;
        case 'remove':
          features = this.removePois;
          break;
      }

      if (!this.selectedPoi) {
        return;
      }

      this.activeFloorName = indrzConfig.layerNamePrefix + this.activeFloor.short_name.toLowerCase();

      features.forEach((feature) => {
        if (feature) {
          if (indrzConfig.layerNamePrefix + (this.selectedPoi.getProperties().floor_name).toLowerCase() !== this.activeFloorName) {
            onActiveLayer = false;
          }
          const featureType = feature.getGeometry().getType().toString();
          if (featureType === 'MultiPolygon' || featureType === 'MultiPoint') {
            if (featureType === 'MultiPoint') {
              feature.setStyle(MapStyles.setPoiStyleOnLayerSwitch(feature.getProperties().icon, onActiveLayer));
            }
          }
        }
      });
    },
    clearPreviousSelection () {
      let onActiveLayer = true;
      this.activeFloorName = indrzConfig.layerNamePrefix + this.activeFloor.short_name.toLowerCase();

      if (this.selectedPoi) {
        if (indrzConfig.layerNamePrefix + (this.selectedPoi.getProperties().floor_name).toLowerCase() !== this.activeFloorName) {
          onActiveLayer = false;
        }
        this.selectedPoi.setStyle(MapStyles.setPoiStyleOnLayerSwitch(this.selectedPoi.getProperties().icon, onActiveLayer));
        this.selectedPoi = null;
        this.clearEditingVectorLayer();
      }
    },
    clearEditingVectorLayer () {
      this.editingVectorLayer.forEach((layer) => {
        this.map.removeLayer(layer);
      });
      this.editingVectorLayer = [];
    },
    enableDeletePoi () {
      this.currentMode = this.mode.remove;
    },
    onDeletePoiClick () {
      this.$root.$emit('deletePoi');
      this.deleteConfirm = false;
    },
    editInteraction () {
      if (!this.selectedPoi) {
        return;
      }

      const currentPoi = this.editPois[this.editPois.length - 1];
      const coord = currentPoi.getGeometry().getCoordinates()[0];
      currentPoi.setStyle(MapStyles.setPoiStyleOnLayerSwitch('', true));
      currentPoi.setStyle(MapStyles.setPoiStyleOnLayerSwitch(null, true));
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
      this.editingVectorLayer.push(new VectorLayer({
        zIndex: 35,
        source: new VectorSource({
          features: [featureMarker]
        }),
        style: [styleMarker]
      }));
      this.map.addLayer(this.editingVectorLayer[this.editingVectorLayer.length - 1]);

      this.translate = new Translate({
        features: new Collection([featureMarker])
      });
      this.map.addInteraction(this.translate);
      this.translate.on('translateend', this.onTranslateEnd);
    },
    addInteractions () {
      this.removeInteraction();
      this.cleanUp();
      this.currentMode = this.mode.add;

      if (!this.activeFloorName || !this.selectedPoiCategory) {
        this.$store.commit('SET_SNACKBAR', 'Please select the POI category and Active floor to continue');
        return;
      }

      this.source = new VectorSource();

      const icon = this.selectedPoiCategory.icon.replace('.', '_pin.');
      this.vectorInteractionLayer = new VectorLayer({
        source: this.source,
        zIndex: 35,
        style: this.getCategoryIconImage(icon)
      });

      this.modify = new Modify({ source: this.source });
      this.map.addInteraction(this.modify);
      this.map.addLayer(this.vectorInteractionLayer);
      this.draw = new Draw({
        source: this.source,
        type: 'Point',
        style: this.getCategoryIconImage(icon)
      });
      this.map.addInteraction(this.draw);
      this.snap = new Snap({ source: this.source });
      this.map.addInteraction(this.snap);
      this.draw.on('drawend', this.onDrawEnd);
      this.modify.on('modifyend', this.onModifyEnd);
      this.modify.on('modifystart', this.onModifyStart);
    },
    onTranslateEnd (e) {
      if (!this.selectedPoi) {
        return;
      }
      const index = this.editPois.findIndex(poi => poi._id === this.selectedPoi._id);

      this.editPois[index].getGeometry().setCoordinates([this.editMarker.getCoordinates()]);
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
      this.map.removeInteraction(this.draw);
      this.map.removeInteraction(this.snap);
      this.map.removeInteraction(this.translate);
      if (this.vectorInteractionLayer) {
        this.map.removeLayer(this.vectorInteractionLayer);
      }
      this.clearEditingVectorLayer();

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
      // this.clearSelection();
      this.selectedPoi = null;
    },
    cleanUp () {
      this.selectedPoi = null;
      this.currentEditingPoi = null;
      this.currentMode = null;
      this.newPois = [];
      this.removePois = [];
      this.editPois = [];
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
      if (!(this.currentMode && this.currentMode === this.mode.add)) {
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
      this.newPois.push(data);
    },
    onPoiLoad ({ removedItems, newItems, oldItems }) {
      this.activeFloorName = indrzConfig.layerNamePrefix + this.activeFloor.short_name.toLowerCase();
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
    },
    getCategoryIconImage (icon) {
      return new Style({
        image: new Icon({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: icon
        })
      });
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
