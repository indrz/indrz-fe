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
      initialPoiCatId: null
    };
  },
  mounted () {
    this.$root.$on('poiLoad', this.$refs.map.onPoiLoad);
    this.$root.$on('deletePoi', this.deletePoi);
  },

  methods: {
    setSelectedPoiCategory (poiCategory) {
      this.selectedPoiCategory = poiCategory;
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
    onSaveButtonClick () {
      if (this.newPoiCollection.length) {
        this.newPoiCollection.forEach(async (newPoi) => {
          await api.postRequest({
            endPoint: `poi/`,
            method: 'POST',
            data: newPoi
          })
        });
        const treeComp = this.$refs.poiTree;
        treeComp.forceReloadNode = true;
        this.initialPoiCatId = this.newPoiCollection[0].category.toString();
        treeComp.loadDataToPoiTree();
        this.$refs.map.currentEditingPoi = null;
      }
      this.$root.$emit('cancelPoiClick');
      this.$nextTick(() => {
        this.newPoiCollection = [];
        this.$root.$emit('addPoiClick');
      });
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
