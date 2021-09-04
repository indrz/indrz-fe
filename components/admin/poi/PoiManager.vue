<template>
  <div>
    <poi-map
      ref="map"
      :selected-poi-category="selectedPoiCategory"
      :active-floor="activeFloor"
      @floorChange="onMapFloorChange"
      @editPoi="onEditPoi"
      @updatePoiCoord="onUpdatePoiCoord"
    />
    <div class="poi">
      <points-of-interest
        ref="poiTree"
        :multi="false"
        :initial-poi-cat-id="initialPoiCatId"
        @selectPoiCategory="setSelectedPoiCategory"
      />
    </div>
    <div class="save-btn-panel">
      <v-btn
        :disabled="!changes"
        @click.stop.prevent="onSaveButtonClick(true)"
        color="primary"
        width="70px"
        small
      >
        Save
      </v-btn>
      <v-btn
        @click.stop.prevent="cleanupAndRemoveInteraction"
        color="primary"
        width="70px"
        small
      >
        Cancel
      </v-btn>
    </div>
    <floor-changer
      ref="floorChanger"
      @floorClick="onFloorClick"
    />
    <action-buttons />
    <v-dialog
      v-model="unsavedChanges"
      persistent
      max-width="350"
    >
      <v-card>
        <v-card-title class="break-word">
          There are unsaved changes. Do you want to save changes?
        </v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="onSaveButtonClick(false)"
            color="error darken-1"
            text
          >
            Yes
          </v-btn>
          <v-btn
            @click="cleanUp"
            color="blue darken-1"
            text
          >
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import PointsOfInterest from '../../poi/PointsOfInterest';
import FloorChanger from '../../FloorChanger';
import PoiMap from './PoiMap';
import ActionButtons from './ActionButtons';
import MapUtil from '~/util/map';
import api from '~/util/api';
import 'ol/ol.css';

export default {
  name: 'PoiManager',
  components: {
    PoiMap,
    ActionButtons,
    FloorChanger,
    PointsOfInterest
  },
  data () {
    return {
      activeFloor: null,
      activeFloorNum: '',
      selectedPoiCategory: null,
      floors: [],
      newPoiCollection: [],
      editPoi: null,
      initialPoiCatId: null,
      unsavedChanges: false,
      mapComp: null,
      lastLoadedData: {}
    };
  },

  computed: {
    changes () {
      const mapComp = this.mapComp;
      return mapComp && (
        mapComp.newPois.length ||
        mapComp.removePois.length ||
        mapComp.editPois.length
      );
    }
  },

  mounted () {
    this.$root.$on('poiLoad', (data) => {
      this.lastLoadedData = { ...data };
      if (this.$refs.map) {
        this.$refs.map.onPoiLoad(data);
      }
    });
    this.$root.$on('deletePoi', this.deletePoi);
    this.mapComp = this.$refs.map;
  },

  methods: {
    setSelectedPoiCategory (poiCategory) {
      const mapComp = this.mapComp;
      this.selectedPoiCategory = poiCategory;

      if (
        mapComp.newPois.length ||
        mapComp.removePois.length ||
        mapComp.editPois.length
      ) {
        this.unsavedChanges = true;
      } else {
        this.$refs.map.removeInteraction();
      }
    },
    onFloorClick (floorNum) {
      this.activeFloorNum = floorNum;
      this.activeFloor = this.$refs.floorChanger.getFloorByFloorNum(floorNum);
      const { map, layers } = this.$refs.map;
      MapUtil.activateLayer(this.activeFloorNum, layers.switchableLayers, map);
    },
    onMapFloorChange ({ floor, floorNum }) {
      this.activeFloor = floor;
      this.$nextTick(function () {
        this.$refs.floorChanger.onFloorClick(floor);
        this.activeFloorNum = floorNum;
      });
    },
    onEditPoi (poi) {
      this.editPoi = poi;
    },
    onUpdatePoiCoord (editingPoi) {
      const foundPoi = this.mapComp.newPois.find((poi) => {
        const coord = JSON.parse(poi.geom).coordinates[0];
        if (editingPoi.oldCoord[0] === coord[0] && editingPoi.oldCoord[1] === coord[1]) {
          return poi;
        }
      });
      if (foundPoi) {
        foundPoi.geom = JSON.stringify({
          type: 'MultiPoint',
          coordinates: [
            editingPoi.newCoord
          ],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:3857'
            }
          }
        });
      }
    },
    onSaveButtonClick (force = true) {
      if (!this.mapComp.currentMode) {
        return;
      }
      switch (this.mapComp.currentMode) {
        case 'add':
          this.saveAddPoi(force);
          break;
        case 'edit':
          this.saveEditPoi();
          break;
        case 'remove':
          this.saveRemovePoi();
          break;
      }
    },
    saveAddPoi (force) {
      this.mapComp.newPois.forEach(async (newPoi) => {
        await api.postRequest({
          endPoint: 'poi/',
          method: 'POST',
          data: newPoi
        }, {
          baseApiUrl: process.env.BASE_API_URL,
          token: process.env.TOKEN
        });
      });
      const treeComp = this.$refs.poiTree;
      treeComp.forceReloadNode = force;
      this.initialPoiCatId = Number(this.mapComp.newPois[0].category);
      if (force) {
        treeComp.loadDataToPoiTree();
      }
      this.$nextTick(() => {
        this.cleanUp(force, 'add');
      });
    },
    saveEditPoi () {
      if (!this.mapComp.editPois.length) {
        return;
      }
      const functions = [];

      this.mapComp.editPois.forEach((poi) => {
        const properties = { ...poi.getProperties() };
        const { floor_num: floorNum, short_name: floorName } = this.activeFloor;
        delete properties.geometry;

        if (!isNaN(floorNum) && floorName) {
          properties.floor_num = floorNum;
          properties.floor_name = floorName;
        }
        const data = {
          category: poi.getProperties().category,
          geometry: {
            type: 'MultiPoint',
            coordinates: poi.getGeometry().getCoordinates(),
            crs: {
              type: 'name',
              properties: {
                name: 'EPSG:3857'
              }
            }
          },
          properties
        };
        functions.push(
          api.putRequest({
            endPoint: `poi/${poi.getId()}/`,
            method: 'PUT',
            data
          }, {
            baseApiUrl: process.env.BASE_API_URL,
            token: process.env.TOKEN
          })
        );
      });
      Promise.all(functions)
        .then((response) => {
          const treeComp = this.$refs.poiTree;

          treeComp.forceReloadNode = true;
          this.initialPoiCatId = Number(this.mapComp.editPois[0].getProperties().category);

          if (!this.unsavedChanges) {
            treeComp.loadDataToPoiTree();
          }
          this.cleanupAndRemoveInteraction();
        });
    },
    saveRemovePoi () {
      this.mapComp.deleteConfirm = true;
    },
    cleanUp (force = false, mode) {
      if (!force) {
        this.$root.$emit('addPoiClick');
      }
      this.cleanupAndRemoveInteraction();
    },
    deletePoi (selectedPoi) {
      if (!this.mapComp.removePois.length) {
        return;
      }
      const functions = [];

      this.mapComp.removePois.forEach((poi) => {
        functions.push(
          api.postRequest({
            endPoint: `poi/${poi.getId()}`,
            method: 'DELETE',
            data: {}
          }, {
            baseApiUrl: process.env.BASE_API_URL,
            token: process.env.TOKEN
          })
        );
      });
      Promise.all(functions)
        .then((response) => {
          const treeComp = this.$refs.poiTree;

          treeComp.forceReloadNode = true;
          this.initialPoiCatId = Number(this.mapComp.removePois[0].getProperties().category);

          if (!this.unsavedChanges) {
            treeComp.loadDataToPoiTree();
          }
          this.cleanupAndRemoveInteraction();
        });
    },
    cleanupAndRemoveInteraction () {
      this.unsavedChanges = false;
      this.mapComp.removeInteraction();
      this.mapComp.cleanUp();
      this.$refs.map.onPoiLoad(this.lastLoadedData);
    }
  }
};
</script>

<style lang="scss" scoped>
  .save-btn-panel {
    position: absolute;
    top: 20px;
    position: absolute;
    left: calc(50% - 70px);
  }
  .poi {
    position: absolute;
    left: 10px;
    top: 20px;
    background: white;
    padding: 15px;
    border-radius: 5px;
  }
</style>
