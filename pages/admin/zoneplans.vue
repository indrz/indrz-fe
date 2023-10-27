<template>
  <v-container class="grey lighten-5">
    <v-row no-gutters>
      <v-col
        cols="6"
        md="4"
      >
        <ZoneplanLayerPanel />
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="8"
      >
        <ZoneplanMap />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ZoneplanLayerPanel from '@/components/admin/zoneplans/ZoneplanLayerPanel';
import ZoneplanMap from '@/components/admin/zoneplans/ZoneplanMap';

export default {
  components: {
    ZoneplanLayerPanel,
    ZoneplanMap
  },
  layout: 'admin',
  mounted () {},
  methods: {}
};
</script>

<style scoped>
</style>
