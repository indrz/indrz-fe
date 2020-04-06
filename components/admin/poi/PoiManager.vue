<template>
  <div class="fill-height">
    <poi-map
      ref="map"
      :selected-poi-category="selectedPoiCategory"
      :active-floor="activeFloor"
      @floorChange="onMapFloorChange"
      @addnewPoi="onAddNewPoi"
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
        :disabled="!newPoiCollection.length && !editPoi"
        @click.stop.prevent="onSaveButtonClick"
      >
        Save
      </v-btn>
      <v-btn color="primary" small width="70px" @click.stop.prevent="onCancelButtonClick">
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
      unsavedChanges: false
    };
  },
  mounted () {
    this.$root.$on('poiLoad', this.$refs.map.onPoiLoad);
    this.$root.$on('deletePoi', this.deletePoi);
  },

  methods: {
    setSelectedPoiCategory (poiCategory) {
      this.selectedPoiCategory = poiCategory;
      if (this.newPoiCollection.length || this.editPoi) {
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
    onAddNewPoi (newPoi) {
      this.newPoiCollection.push(newPoi);
    },
    onEditPoi (poi) {
      this.editPoi = poi;
    },
    onUpdatePoiCoord (editingPoi) {
      const foundPoi = this.newPoiCollection.find((poi) => {
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
      if (this.newPoiCollection.length) {
        this.newPoiCollection.forEach(async (newPoi) => {
          await api.postRequest({
            endPoint: `poi/`,
            method: 'POST',
            data: newPoi
          })
        });
        const treeComp = this.$refs.poiTree;
        treeComp.forceReloadNode = force;
        this.initialPoiCatId = this.newPoiCollection[0].category.toString();
        if (force) {
          treeComp.loadDataToPoiTree();
        }
        this.$refs.map.currentEditingPoi = null;
      } else if (this.editPoi) {
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
      }
      this.$root.$emit('cancelPoiClick');
      this.$nextTick(() => {
        this.cleanUp();
      });
    },
    cleanUp () {
      if (this.newPoiCollection.length) {
        this.$root.$emit('addPoiClick');
      }
      this.unsavedChanges = false;
      this.newPoiCollection = [];
      this.editPoi = null;
    },
    async deletePoi (selectedPoi) {
      await api.postRequest({
        endPoint: `poi/${selectedPoi.getId()}`,
        method: 'DELETE',
        data: {}
      });
      const treeComp = this.$refs.poiTree;
      treeComp.forceReloadNode = true;
      this.initialPoiCatId = selectedPoi.getProperties().category.toString();
      treeComp.loadDataToPoiTree();
    },
    onCancelButtonClick () {
      this.newPoiCollection = [];
      this.editPoi = null;
      this.$root.$emit('cancelPoiClick');
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
