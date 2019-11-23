<template>
  <div class="fill-height">
    <poi-map
      ref="map"
      :selected-poi-category="selectedPoiCategory"
      :active-floor="activeFloor"
      @floorChange="onMapFloorChange"
      @addnewPoi="onAddNewPoi"
    />
    <div class="poi">
      <points-of-interest @selectPoiCategory="setSelectedPoiCategory" />
    </div>
    <div class="save-btn-panel">
      <v-btn color="primary" small width="70px" @click.stop.prevent="onSaveButtonClick">
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
      newPoiCollection: []
    };
  },
  mounted () {
    this.$root.$on('poiLoad', this.$refs.map.onPoiLoad);
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
    onSaveButtonClick () {
      if (this.newPoiCollection.length) {
        this.newPoiCollection.forEach((newPoi) => {
          api.postRequest({
            endPoint: `poi/`,
            method: 'POST',
            data: newPoi
          })
        });
      }
      this.$root.$emit('cancelPoiClick');
    },
    onCancelButtonClick () {
      this.newPoiCollection = [];
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
