<template>
  <div class="fill-height">
    <poi-map ref="map" @floorChange="onMapFloorChange" />
    <div class="poi">
      <points-of-interest />
    </div>
    <div class="save-btn-panel">
      <v-btn color="primary" small width="70px">Save</v-btn>
      <v-btn color="primary" small width="70px">Cancel</v-btn>
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
      activeFloorName: '',
      floors: []
    };
  },
  mounted () {
    this.$root.$on('poiLoad', this.$refs.map.onPoiLoad);
  },

  methods: {
    onFloorClick (floorName) {
      this.activeFloorName = floorName;
      const { map, layers } = this.$refs.map;
      MapUtil.activateLayer(this.activeFloorName, layers.switchableLayers, map);
    },
    onMapFloorChange ({ floor, floors, name }) {
      this.$nextTick(function () {
        this.$refs.floorChanger.onFloorClick(floor);
        this.activeFloorName = name;
        this.floors = floors;
      });
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
