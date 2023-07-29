<template>
  <div>
    <div :id="mapId" :ref="map" class="fluid flat width='100%' style='border-radius: 0" />
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
    <v-dialog
      v-model="deleteConfirm"
      persistent
      max-width="350"
    >
      <v-card>
        <v-card-title v-if="removePois.length > 1" class="break-word">
          Are you sure you want to delete all {{ removePois.length }} poi's?
        </v-card-title>
        <v-card-title v-if="removePois.length === 1" class="break-word">
          Are you sure you want to delete the selected poi?
        </v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error darken-1"
            text
            @click="onDeletePoiClick"
          >
            Yes
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="deleteConfirm = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <attributes-overlay
      ref="attributesOverlay"
      @closeClick="closeAttributePopup"
      @saveClick="saveAttributes"
      @uploadImage="uploadPoiImage"
      @deleteClick="deleteAttribute"
      @poiImageDeleteClick="poiImageDeleteClick"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import { Draw, Modify, Snap, Translate } from 'ol/interaction';
import { Point } from 'ol/geom';
import Overlay from 'ol/Overlay';
import { Feature, Collection } from 'ol';
import POIHandler from '../../../util/POIHandler';
import MapStyles from '../../../util/mapStyles';
import AttributesOverlay from './AttributesOverlay.vue'
import api from '@/util/api'
import config from '~/util/indrzConfig';
import MapUtil from '~/util/map';
import 'ol/ol.css';

const { env } = config;

export default {
  name: 'PoiMap',
  components: {
    AttributesOverlay
  },
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
      mapId: 'poiMapContainer',
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
  computed: {
    ...mapState({
      floors: state => state.floor.floors
    }),
    isMobile () {
      return this.$vuetify.breakpoint.mobile;
    },
    defaultCenter () {
      return this.isMobile ? env.MOBILE_START_CENTER_XY : env.DEFAULT_CENTER_XY
    },
    env () {
      return {
        homePageUrl: env.HOME_PAGE_URL,
        logo: env.LOGO_FILE,
        baseApiUrl: env.BASE_API_URL,
        token: env.TOKEN,
        baseWmsUrl: env.BASE_WMS_URL,
        geoServerLayerPrefix: env.GEO_SERVER_LAYER_PREFIX,
        layerNamePrefix: env.LAYER_NAME_PREFIX,
        center: this.defaultCenter
      };
    }
  },
  async mounted () {
    await this.loadFloors();
    this.initializeMap();
  },
  methods: {
    ...mapActions({
      loadFloors: 'floor/LOAD_FLOORS'
    }),
    initializeMap () {
      this.popup = new Overlay({
        element: document.getElementById('attributes-overlay'),
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        },
        zIndex: 5,
        name: 'attributesPopup'
      });
      const { view, map, layers } = MapUtil.initializeMap({
        mapId: this.mapId,
        predefinedPopup: this.popup,
        isMobile: this.isMobile
      });

      this.view = view;
      this.map = map;
      this.layers = layers;

      this.map.on('singleclick', this.onMapClick, this);
      window.onresize = () => {
        this.map.updateSize();
        MapUtil.handleWindowResize(this.mapId);
      };

      if (this.floors && this.floors.length) {
        this.intitialFloor = this.floors.filter(floor => floor.floor_num === env.DEFAULT_START_FLOOR)[0];
        this.activeFloorNum = env.LAYER_NAME_PREFIX + this.intitialFloor.floor_num;

        this.$emit('floorChange', {
          floor: this.intitialFloor,
          floorNum: this.activeFloorNum
        });

        this.wmsLayerInfo = MapUtil.getWmsLayers(this.floors, this.env);
      }
      this.layers.layerGroups.push(this.wmsLayerInfo.layerGroup);
      this.layers.switchableLayers = this.wmsLayerInfo.layers;
      this.map.addLayer(this.wmsLayerInfo.layerGroup);
    },
    addPoiClick () {
      this.addInteractions();
    },
    editPoiClick () {
      this.currentMode = this.mode.edit;
    },
    deletePoiClick () {
      this.enableDeletePoi();
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

        if (featureType === 'Point') {
          const newPoint = this.newPois.find(poi => poi.olUid === feature.ol_uid)

          if (newPoint) {
            const coordinate = JSON.parse(newPoint.geom).coordinates[0];
            this.openAttributesPopup(newPoint, coordinate);
          }
        }

        if (featureType === 'MultiPolygon' || featureType === 'MultiPoint') {
          if (featureType === 'MultiPoint') {
            this.activeFloorNum = env.LAYER_NAME_PREFIX + this.activeFloor.floor_num;
            let onActiveLayer = true;
            if ((env.LAYER_NAME_PREFIX + feature.getProperties().floor_num) !== this.activeFloorNum) {
              onActiveLayer = false;
            }

            feature.setStyle(MapStyles.setPoiStyleOnLayerSwitch('/media/poi_icons/selected_pin.png', onActiveLayer));
            this.selectedPoi = feature;
            if (this.currentMode && this.currentMode === this.mode.remove) {
              this.removePois.push(this.selectedPoi);
            } else if (this.currentMode && this.currentMode === this.mode.edit) {
              this.editPois.push(this.selectedPoi);
              this.editInteraction();
            } else {
              this.clearPreviousSelection();
              this.openAttributesPopup(feature.getProperties(), feature.getGeometry().getCoordinates()[0], feature);
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

      this.activeFloorNum = env.LAYER_NAME_PREFIX + this.activeFloor.floor_num;

      features.forEach((feature) => {
        if (feature) {
          if ((env.LAYER_NAME_PREFIX + this.selectedPoi.getProperties().floor_num) !== this.activeFloorNum) {
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
      this.activeFloorNum = env.LAYER_NAME_PREFIX + this.activeFloor.floor_num;

      if (this.selectedPoi) {
        if ((env.LAYER_NAME_PREFIX + this.selectedPoi.getProperties().floor_num) !== this.activeFloorNum) {
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
      this.$root.$emit('deletePois');
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
          src: '/images/selected.png'
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

      if (!this.activeFloorNum || !this.selectedPoiCategory) {
        this.$store.commit('SET_SNACKBAR', 'Please select the POI category and Active floor to continue');
        return;
      }

      this.source = new VectorSource();

      const { icon } = this.selectedPoiCategory;
      // const extension = icon.substring(icon.lastIndexOf('.'));
      // icon = icon.replace(extension, '_pin' + extension);

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
    removeInteraction (all = false) {
      this.map.removeInteraction(this.draw);
      this.map.removeInteraction(this.snap);
      this.map.removeInteraction(this.translate);

      if (all) {
        this.vectorInteractionLayer && this.map.removeLayer(this.vectorInteractionLayer);
        this.clearEditingVectorLayer();
        this.closeAttributePopup()
      }

      if (this.draw) {
        this.draw.un('drawend', this.onDrawEnd);
      }
      if (this.modify) {
        this.modify.un('modifyend', this.onModifyEnd);
      }
      if (this.modify) {
        this.modify.un('modifystart', this.onModifyStart);
      }
      if (this.translate) {
        this.translate.un('translateend', this.onTranslateEnd);
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
      const mapLayers = this.map.getLayers().getArray().slice();

      const data = {
        floor: 1,
        name: this.selectedPoiCategory.name,
        description: '',
        enabled: true,
        name_en: this.selectedPoiCategory.name_en,
        name_de: this.selectedPoiCategory.name_de,
        floor_num: this.activeFloor.floor_num,
        floor_name: this.activeFloor.short_name,
        category: this.selectedPoiCategory.id,
        geom: JSON.stringify({
          type: 'MultiPoint',
          coordinates: [
            coordinate
          ],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:3857'
            }
          }
        }),
        olUid: drawEvent.feature.ol_uid,
        layerOlUid: mapLayers[mapLayers.length - 1].ol_uid
      };
      this.newPois.push(data);
      this.removeInteraction();
      this.openAttributesPopup(data, coordinate)
    },
    onPoiLoad ({ removedItems, newItems, oldItems }) {
      this.activeFloorNum = env.LAYER_NAME_PREFIX + this.activeFloor.floor_num;
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
        });
      }
      if (newItems && newItems.length) {
        newItems.forEach((item) => {
          POIHandler
            .fetchPoi(item.id, this.map, this.activeFloorNum, {
              baseApiUrl: process.env.BASE_API_URL,
              token: process.env.TOKEN,
              layerNamePrefix: process.env.LAYER_NAME_PREFIX
            })
            .then((poiLayer) => {
              this.map.getLayers().forEach((layer) => {
                if (layer.getProperties().id === 99999) {
                  layer.getLayers().push(poiLayer);
                }
              });
            });
        });
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
    },
    closeAttributePopup () {
      this.popup.setPosition(undefined)
    },
    saveAttributes (attributes) {
      const { feature, data, imageFile } = attributes;

      if (attributes.feature) {
        // we can remove the imageFile here
        this.$emit('saveEditPoi', feature, data)
      } else {
        this.$emit('saveAddPoi', data, imageFile, (poiId, file) => {
          this.uploadPoiImage({ poiId, imageFile: file })
        })
      }
    },
    async uploadPoiImage ({ poiId, imageFile }) {
      try {
        await api.postRequest({
          endPoint: 'poi/images/',
          method: 'POST',
          data: {
            poi: poiId,
            image: imageFile,
            sort_order: '1',
            is_default: 'true',
            alt_text: 'super image'
          }
        }, {
          baseApiUrl: process.env.BASE_API_URL,
          token: process.env.TOKEN
        });
        await this.refreshImageList(poiId);
      } catch (e) {
        this.$store.commit('SET_SNACKBAR', e?.message || 'Image upload failed');
      }
    },
    deleteAttribute (attributes) {
      if (attributes.feature) {
        this.$emit('deletePoi', attributes.feature)
      } else {
        const mapLayers = this.map.getLayers().getArray().slice();
        this.newPois = this.newPois.filter(poi => poi.olUid !== attributes.data.olUid);

        mapLayers.forEach((layer) => {
          if (layer.ol_uid === attributes.data.layerOlUid) {
            this.map.removeLayer(layer);
          }
        });
      }
      this.closeAttributePopup();
    },
    async poiImageDeleteClick ({ id, feature }) {
      try {
        await api.postRequest({
          endPoint: `poi/images/${id}`,
          method: 'DELETE',
          data: {}
        }, {
          baseApiUrl: process.env.BASE_API_URL,
          token: process.env.TOKEN
        });

        await this.refreshImageList(feature.getId());
      } catch (e) {
        this.$store.commit('SET_SNACKBAR', e?.message || 'Image delete failed');
      }
    },
    openAttributesPopup (data, coordinate, feature) {
      const images = feature ? feature.getProperties().images : [];
      this.$refs.attributesOverlay.setData({ ...data, images }, feature);
      this.popup.setPosition(coordinate);
      this.popup.setOffset([0, -40]);
    },
    getPoi (poiId) {
      try {
        return api.request({
          endPoint: `poi/${poiId}`
        }, {
          baseApiUrl: process.env.BASE_API_URL,
          token: process.env.TOKEN
        });
      } catch (e) {
        this.$store.commit('SET_SNACKBAR', e?.message || 'Fetch poi failed');
      }
    },
    async refreshImageList (poiId) {
      const response = await this.getPoi(poiId);
      const images = response?.data?.properties?.images;

      this.$refs.attributesOverlay?.setImages(images);
    }
  }
};
</script>

<style scoped>
  #poiMapContainer {
    height: calc(100vh - 48px) !important;
  }
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
