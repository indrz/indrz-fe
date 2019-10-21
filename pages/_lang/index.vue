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
        :opened-panels="openedPanels"
        ref="sideBar"
        @menuButtonClick="onMenuButtonClick"
        @locationClick="onLocationClick"
        @setGlobalRoute="onSetGlobalRoute"
        @routeGo="onRouteGo"
        @clearRoute="onClearRoute"
        @shareClick="onShareClick"
      />
    </v-navigation-drawer>
    <v-toolbar
      dense
      floating
      class="ma-2"
      max-width="320px"
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <campus-search ref="searchComp" @selectSearhResult="onSearchSelect" />
    </v-toolbar>
    <indrz-map ref="map" @selectFloor="onFloorSelect" @clearSearch="onClearSearch" @popupRouteClick="onPopupRouteClick" />
    <floor-changer ref="floorChanger" :floors="floors" @floorClick="onFloorClick" />
    <snack-bar />
  </v-card>
</template>

<script>
import IndrzMap from '../../components/IndrzMap';
import Sidebar from '../../components/Sidebar';
import FloorChanger from '../../components/FloorChanger';
import CampusSearch from '../../components/CampusSearch';
import SnackBar from '../../components/SnackBar';
import api from '../../util/api';

export default {
  components: {
    Sidebar,
    IndrzMap,
    FloorChanger,
    CampusSearch,
    SnackBar
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
      mapElName: 'mapCard',
      openedPanels: []
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
      this.$refs.floorChanger.selectFloorWithCss(floor);
    },
    onSearchSelect (selectedItem) {
      this.$refs.map.onSearchSelect(selectedItem);
    },
    onSetGlobalRoute (selectedItem) {
      this.$refs.map.setGlobalRoute(selectedItem);
    },
    onRouteGo () {
      this.$refs.map.routeGo();
    },
    onClearSearch () {
      this.$refs.searchComp.clearSearch();
    },
    onPopupRouteClick (routeInfo) {
      this.drawer = true;
      this.openedPanels = [1];
      setTimeout(() => {
        this.$refs.sideBar.setRoute(routeInfo);
      }, 500);
    },
    onClearRoute () {
      this.$refs.map.clearRouteData();
    },
    onShareClick () {
      this.$refs.map.onShareButtonClick(true);
    }
  }
}
</script>

<style scoped>
  header {
    position: absolute;
    z-index: 6;
  }
  nav {
    z-index: 7
  }
</style>
