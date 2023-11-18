<template>
  <v-container class="grey lighten-5">
    <v-row no-gutters>
      <v-col
        cols="6"
        md="4"
      >
        <ZoneplanLayerPanel @layer-toggled="handleLayerToggle" />
      </v-col>
      <v-col
        cols="6"
        sm="6"
        md="8"
      >
        <BaseMap ref="baseMap" />
        <FloorChanger class="custom-floor-changer" @floor-selected="onFloorSelected" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import ZoneplanLayerPanel from '@/components/admin/zoneplans/ZoneplanLayerPanel';
import BaseMap from '@/components/BaseMap';
import FloorChanger from '@/components/admin/zoneplans/FloorChanger';

export default {
  name: 'Zoneplans',
  components: {
    ZoneplanLayerPanel,
    BaseMap,
    FloorChanger
  },
  layout: 'admin',
  data () {
    return {
      activeLayers: [],
      currentFloorNum: 0.0
    };
  },
  mounted () {},
  methods: {
    async handleLayerToggle (layerInfo) {
      const baseMapComponent = this.$refs.baseMap;
      if (layerInfo.active) {
        const apiURL = `http://localhost/api/v1/orgcode/${layerInfo.orgcode}/?floor_num=${this.currentFloorNum}`;
        // const apiURL = 'http://localhost/api/v1/orgcode/' + layerInfo.orgcode + '/?floor_num=0.0'; // Replace with the actual API URL
        const axiosInstance = axios.create({
          baseURL: apiURL,
          headers: {
            Authorization: 'Token 449dacbbc14522dc7c0888e7fdf31a3bdc677bf3' // Assuming you are using token-based auth
          }
        });
        try {
          const response = await axiosInstance.get();
          console.log('handleLayerToggle', layerInfo, response.data);
          baseMapComponent.addLayer(layerInfo.name, layerInfo.color, response.data);
          this.activeLayers.push(layerInfo); // Add layer info to activeLayers
        } catch (error) {
          console.error('Error fetching GeoJSON:', error);
          // Handle the error appropriately
        }
      } else {
        baseMapComponent.removeLayer(layerInfo.name);
        // Remove layer info from activeLayers
        this.activeLayers = this.activeLayers.filter(layer => layer.name !== layerInfo.name);
      }
    },
    async refreshLayersForNewFloor () {
      const baseMapComponent = this.$refs.baseMap;

      // Remove all current layers
      this.activeLayers.forEach((layer) => {
        baseMapComponent.removeLayer(layer.name);
      });

      // Re-add layers with updated floor data
      for (const layerInfo of this.activeLayers) {
        const apiURL = `http://localhost/api/v1/orgcode/${layerInfo.orgcode}/?floor_num=${this.currentFloorNum}`;
        try {
          const axiosInstance = axios.create({
            baseURL: apiURL,
            headers: {
              Authorization: 'Token 449dacbbc14522dc7c0888e7fdf31a3bdc677bf3' // Assuming you are using token-based auth
            }
          });

          const response = await axiosInstance.get(apiURL);
          baseMapComponent.addLayer(layerInfo.name, layerInfo.color, response.data);
        } catch (error) {
          console.error('Error refreshing layer:', layerInfo.name, error);
        }
      }
    },
    onFloorSelected (floorNum) {
      console.log('Selected floor:', floorNum);
      this.currentFloorNum = floorNum;
      this.refreshLayersForNewFloor();
    }
  }
};
</script>
<style scoped>
</style>
