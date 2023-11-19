<template>
  <v-list dense class="floor-changer-list">
    <v-list-item
      v-for="floor in floors"
      :key="floor.id"
      :class="{ 'floor-item-selected': floor.floor_num === currentFloorNum }"
      @click="selectFloor(floor.floor_num)"
    >
      <v-list-item-content>
        <v-list-item-title>{{ floor.short_name }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>
<script>
import { fetchFloors } from '@/components/admin/zoneplans/api'

export default {
  name: 'FloorChanger',
  data () {
    return {
      floors: [],
      currentFloorNum: 0.0
    };
  },
  mounted () {
    this.fetchFloorsWrapper();
  },
  methods: {
    async fetchFloorsWrapper () {
      try {
        const floors = await fetchFloors();
        this.floors = floors;
        this.selectDefaultFloor();
      } catch (error) {
        // Handle error appropriately
      }
    },
    selectFloor (floorNum) {
      // Existing method to select a floor
      this.currentFloorNum = floorNum;
      this.$emit('floor-selected', floorNum);
    },
    selectDefaultFloor () {
      const defaultFloor = 0.0
      // const defaultFloor = this.floors.find(floor => floor.floor_num === 0.0);
      if (defaultFloor) {
        this.selectFloor(defaultFloor.floor_num);
      }
    }
  }
};
</script>

<style>
.floor-changer-list {
  position: absolute;
  top: 30px;
  right: 20px;
  width: 100px;
  max-height: 300px;
  overflow-y: auto; /* Enables vertical scrolling */
  scrollbar-width: thin;
}
.floor-item-selected {
  background-color: #456e8d; /* or any other color to indicate selection */
}
</style>
