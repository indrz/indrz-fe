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
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import ZoneplanLayerPanel from '@/components/admin/zoneplans/ZoneplanLayerPanel';
import BaseMap from '@/components/BaseMap';

export default {
  name: 'Zoneplans',
  components: {
    ZoneplanLayerPanel,
    BaseMap
  },
  layout: 'admin',
  mounted () {},
  methods: {
    async handleLayerToggle (layerInfo) {
      const baseMapComponent = this.$refs.baseMap;
      if (layerInfo.active) {
        const apiURL = 'http://localhost/api/v1/orgcode/' + layerInfo.orgcode + '/?floor_num=0.0'; // Replace with the actual API URL
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
        } catch (error) {
          console.error('Error fetching GeoJSON:', error);
          // Handle the error appropriately
        }
      } else {
        baseMapComponent.removeLayer(layerInfo.name);
      }
    }
  }
};
</script>
<style scoped>
</style>
