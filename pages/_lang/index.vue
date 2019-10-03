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
      <campus-search @selectSearhResult="onSearchSelect" />
    </v-toolbar>
    <indrz-map ref="map" @selectFloor="onFloorSelect" />
    <floor-changer ref="floorChanger" :floors="floors" @floorClick="onFloorClick" />
  </v-card>
</template>

<script>
import IndrzMap from '../../components/IndrzMap';
import Sidebar from '../../components/Sidebar';
import FloorChanger from '../../components/FloorChanger';
import CampusSearch from '../../components/CampusSearch';
import api from '../../util/api';

export default {
  components: {
    Sidebar,
    IndrzMap,
    FloorChanger,
    CampusSearch
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
      miniVariant: false,
      mapId: 'mapContainer',
      map: null,
      mapElName: 'mapCard'
    }
  },
  watch: {
    search (text) {
      if (!text || text.length < 3) {
        return;
      }
      this.term$.next(text);
    }
  },

  async mounted () {
    const floorData = await this.fetchFloors();
    if (floorData && floorData.data && floorData.data.results) {
      this.floors = floorData.data.results;
      this.$refs.map.loadLayers(this.floors);
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
    },
    onSearchSelect (selectedItem) {
      this.$refs.map.onSearchSelect(selectedItem);
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
