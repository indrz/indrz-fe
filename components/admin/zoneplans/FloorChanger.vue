<template>
  <v-list dense class="floor-changer-list">
    <v-list-item
      v-for="floor in floors"
      :key="floor.id"
      @click="selectFloor(floor.floor_num)"
    >
      <v-list-item-content>
        <v-list-item-title>{{ floor.short_name }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>
<script>
import axios from 'axios';

export default {
  name: 'FloorChanger',
  data () {
    return {
      floors: [],
      currentFloorNum: 0.0
    };
  },
  mounted () {
    this.fetchFloors();
  },
  methods: {
    async fetchFloors () {
      const apiURL = 'http://localhost/api/v1/floor/'; // Replace with the actual API URL

      // If the token is stored in local storage or some state management
      // const token = localStorage.getItem('token'); // or however you store your token

      const axiosInstance = axios.create({
        baseURL: apiURL,
        headers: {
          Authorization: 'Token 449dacbbc14522dc7c0888e7fdf31a3bdc677bf3' // Assuming you are using token-based auth
        }
      });
      try {
        const response = await axiosInstance.get();
        this.floors = response.data.results;
        this.selectDefaultFloor();
      } catch (error) {
        console.error('Error fetching floors:', error);
        // Handle error appropriately
      }
    },
    selectFloor (floorNum) {
      // Existing method to select a floor
      this.$emit('floor-selected', floorNum);
    },
    selectDefaultFloor () {
      const defaultFloor = this.floors.find(floor => floor.floor_num === 0.0);
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
}
</style>
