<template>
  <v-card
    class="fill-height"
    fluid
    flat
    :name="mapElName"
    width="100%"
    style="border-radius: 0"
    :ripple="false"
    @click.stop="onMapClick($event)"
  >
    <v-navigation-drawer
      v-model="drawer"
      absolute
      bottom
      temporary
      app
    >
      <sidebar
        :menu-items="items"
        @menuButtonClick="onMenuButtonClick"
        @locationClick="onLocationClick"
      />
    </v-navigation-drawer>
    <v-toolbar
      dense
      floating
      class="ma-2"
      max-width="320px"
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-text-field
        hide-details
        append-icon="mdi-magnify"
        single-line
        solo
        flat
        :label="searchLabel"
      />
    </v-toolbar>
    <indrz-map ref="map" :floors="floors" @selectFloor="onFloorSelect" />
    <floor-changer ref="floorChanger" :floors="floors" @floorClick="onFloorClick" />
  </v-card>
</template>

<script>
import IndrzMap from '../../components/IndrzMap';
import Sidebar from '../../components/Sidebar';
import FloorChanger from '../../components/FloorChanger';
import api from '../../util/api';

export default {
  components: {
    Sidebar,
    IndrzMap,
    FloorChanger
  },
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      floors: [],
      loading: true,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Home',
          to: '/'
        }
      ],
      picker: new Date().toISOString().substr(0, 10),
      searchLabel: this.$t('search_our_campus'),
      miniVariant: false,
      mapId: 'mapContainer',
      map: null,
      mapElName: 'mapCard'
    }
  },

  async mounted () {
    const floorData = await this.fetchFloors();

    if (floorData && floorData.data && floorData.data.results) {
      this.floors = floorData.data.results;
    }
    this.loading = false;

    if (this.setSelection) {
      this.selectFloorWithCss(this.setSelection);
    }
  },
  methods: {
    fetchFloors () {
      return api.request({
        endPoint: 'floor'
      });
    },
    onDrawerClick () {
      this.$emit('onDrawerClick')
    },
    onMapClick (e) {
      if (e.target.getAttribute('name') !== this.mapElName) {
        return;
      }
      console.log('Map Event');
    },
    onMenuButtonClick (type) {
      this.$refs.map.onMenuButtonClick(type);
    },
    onLocationClick (value) {
      this.$refs.map.onLocationClick(value);
    },
    onFloorClick (floor) {
      this.$refs.map.onFloorClick(floor);
    },
    onFloorSelect (floor) {
      this.$refs.floorChanger.setSelection = floor;
    }
  }
}
</script>

<style scoped>
  header {
    position: absolute;
    z-index: 100;
  }
  nav {
    z-index: 101
  }
</style>
