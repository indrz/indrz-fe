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
import ZoneplanLayerPanel from '@/components/admin/zoneplans/ZoneplanLayerPanel';
import BaseMap from '@/components/BaseMap';
import FloorChanger from '@/components/admin/zoneplans/FloorChanger';
import { fetchOrgcodeData } from '@/components/admin/zoneplans/api';

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
        try {
          this.activeLayers.push(layerInfo); // Add layer info to activeLayers
          const layerData = await fetchOrgcodeData(layerInfo.orgcode, this.currentFloorNum);
          if (layerData) {
            baseMapComponent.addLayer(layerInfo.name, layerInfo.color, layerData);
          } else {
            console.log('No features found for layer:', layerInfo.name);
          }
          // baseMapComponent.addLayer(layerInfo.name, layerInfo.color, layerData);
          // this.activeLayers.push(layerInfo); // Add layer info to activeLayers
        } catch (error) {
          console.error('Error fetching GeoJSON:', error);
          // Handle the error appropriately
        }
      } else {
        baseMapComponent.removeLayer(layerInfo.name);
        this.activeLayers = this.activeLayers.filter(layer => layer.name !== layerInfo.name);
      }
    },

    async refreshLayersForNewFloor () {
      const baseMapComponent = this.$refs.baseMap;
      this.activeLayers.forEach(layer => baseMapComponent.removeLayer(layer.name));

      for (const layerInfo of this.activeLayers) {
        try {
          const layerData = await fetchOrgcodeData(layerInfo.orgcode, this.currentFloorNum);
          if (layerData) {
            baseMapComponent.addLayer(layerInfo.name, layerInfo.color, layerData);
          } else {
            console.log('No features found for layer:', layerInfo.name);
          }
        } catch (error) {
          console.error('Error refreshing layer:', layerInfo.name, error);
        }
      }
    },
    onFloorSelected (floorNum) {
      console.log("current floor's number is: ", floorNum);
      console.log('active layers are: ', this.activeLayers);
      this.currentFloorNum = floorNum;
      this.refreshLayersForNewFloor();
    }
  }
};
</script>
<style scoped>
</style>
