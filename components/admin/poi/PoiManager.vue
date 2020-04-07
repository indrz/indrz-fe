<template>
  <div class="fill-height">
    <poi-map
      ref="map"
      :selected-poi-category="selectedPoiCategory"
      :active-floor="activeFloor"
      @floorChange="onMapFloorChange"
      @editPoi="onEditPoi"
      @updatePoiCoord="onUpdatePoiCoord"
    />
    <div class="poi">
      <points-of-interest ref="poiTree" :multi="false" :initial-poi-cat-id="initialPoiCatId" @selectPoiCategory="setSelectedPoiCategory" />
    </div>
    <div class="save-btn-panel">
      <v-btn
        color="primary"
        small
        width="70px"
        :disabled="!changes"
        @click.stop.prevent="onSaveButtonClick(true)"
      >
        Save
      </v-btn>
      <v-btn color="primary" small width="70px" @click.stop.prevent="cleanupAndRemoveInteraction">
        Cancel
      </v-btn>
    </div>
    <floor-changer ref="floorChanger" :floors="floors" @floorClick="onFloorClick" />
    <action-buttons />
    <v-dialog
      v-model="unsavedChanges"
      persistent
      max-width="350"
    >
      <v-card>
        <v-card-title>There are unsaved changes. Do you want to save changes?</v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error darken-1" text @click="onSaveButtonClick(false)">
            Yes
          </v-btn>
          <v-btn color="blue darken-1" text @click="cleanUp">
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
      activeFloorName: '',
      selectedPoiCategory: null,
      floors: [],
      newPoiCollection: [],
      editPoi: null,
      initialPoiCatId: null,
      unsavedChanges: false,
      mapComp: null
    };
  },

  computed: {
    changes () {
      return this.mapComp && (this.mapComp.newPois.length || this.mapComp.removePois.length);
    }
  },

  mounted () {
    this.$root.$on('poiLoad', this.$refs.map.onPoiLoad);
    this.$root.$on('deletePoi', this.deletePoi);
    this.mapComp = this.$refs.map;
  },

  methods: {
    setSelectedPoiCategory (poiCategory) {
      this.selectedPoiCategory = poiCategory;

      if (this.mapComp.newPois.length || this.mapComp.removePois.length) {
        this.unsavedChanges = true;
      } else {
        this.$refs.map.removeInteraction();
      }
    },
    onFloorClick (floorName) {
      this.activeFloorName = floorName;
      this.activeFloor = this.$refs.floorChanger.getFloorByFloorName(floorName);
      const { map, layers } = this.$refs.map;
      MapUtil.activateLayer(this.activeFloorName, layers.switchableLayers, map);
    },
    onMapFloorChange ({ floor, floors, name }) {
      this.floors = floors;
      this.activeFloor = floor;
      this.$nextTick(function () {
        this.$refs.floorChanger.onFloorClick(floor);
        this.activeFloorName = name;
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
          'type': 'MultiPoint',
          'coordinates': [
            editingPoi.newCoord
          ],
          'crs': {
            'type': 'name',
            'properties': {
              'name': 'EPSG:3857'
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
          endPoint: `poi/`,
          method: 'POST',
          data: newPoi
        })
      });
      const treeComp = this.$refs.poiTree;
      treeComp.forceReloadNode = force;
      this.initialPoiCatId = this.mapComp.newPois[0].category.toString();
      if (force) {
        treeComp.loadDataToPoiTree();
      }
      this.$nextTick(() => {
        this.cleanUp(force, 'add');
      });
    },
    saveEditPoi () {
      const { feature } = this.editPoi;
      feature.getGeometry().setCoordinates([this.editPoi.coord]);
      const data = {
        'category': feature.getProperties().category,
        'geometry': {
          'type': 'MultiPoint',
          'coordinates': feature.getGeometry().getCoordinates()
        }
      };
      api.putRequest({
        endPoint: `poi/${feature.getId()}/`,
        method: 'PUT',
        data
      })
        .then((resp) => {
          console.log(resp);
        });
      this.cleanUp(false, 'edit');
    },
    saveRemovePoi () {
      this.mapComp.deleteConfirm = true;
    },
    cleanUp (force = false, mode) {
      if (!force) {
        this.$root.$emit('addPoiClick');
      }
      this.unsavedChanges = false;
      this.mapComp.cleanUp();
      this.mapComp.removeInteraction();
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
          })
        )
      });
      Promise.all(functions)
        .then((response) => {
          const treeComp = this.$refs.poiTree;

          treeComp.forceReloadNode = true;
          this.initialPoiCatId = this.mapComp.removePois[0].getProperties().category.toString();
          treeComp.loadDataToPoiTree();
          this.cleanupAndRemoveInteraction();
        });
    },
    cleanupAndRemoveInteraction () {
      this.mapComp.cleanUp();
      this.mapComp.removeInteraction();
    }
  }
}
</script>

<style lang="scss" scoped>
  .save-btn-panel {
    position: absolute;
    top: 10px;
    position: absolute;
    left: calc(50% - 70px);
  }
  .poi {
    position: absolute;
    left: 10px;
    top: 70px;
    background: white;
    padding: 15px;
    border-radius: 5px;
  }
</style>
