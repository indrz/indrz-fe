<template>
  <v-card
    :name="mapElName"
    :ripple="false"
    style="border-radius: 0"
    fluid
    flat
  >
    <v-navigation-drawer
      v-model="drawer"
      style="width: 275px"
      fixed
      app
    >
      <sidebar
        ref="sideBar"
        :menu-items="items"
        :opened-panels="openedPanels"
        :initial-poi-cat-id="initialPoiCatId"
        :initial-poi-id="initialPoiId"
        @menuButtonClick="onMenuButtonClick"
        @locationClick="onLocationClick"
        @setGlobalRoute="onSetGlobalRoute"
        @routeGo="onRouteGo"
        @clearRoute="onClearRoute"
        @shareClick="onShareClick"
        @poiLoad="onPoiLoad"
        @loadSinglePoi="loadSinglePoi"
        @hideSidebar="drawer = false"
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
    <indrz-map
      ref="map"
      @selectFloor="onFloorSelect"
      @clearSearch="onClearSearch"
      @popupRouteClick="onPopupRouteClick"
      @openPoiTree="onOpenPoiTree"
      @openPoiToPoiRoute="onOpenPoiToPoiRoute"
      @showSearchResult="onShowSearchResult"
    />
    <floor-changer ref="floorChanger" @floorClick="onFloorClick" />
    <snack-bar />
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import IndrzMap from '../../components/IndrzMap';
import Sidebar from '../../components/Sidebar';
import FloorChanger from '../../components/FloorChanger';
import CampusSearch from '../../components/CampusSearch';
import SnackBar from '../../components/SnackBar';
import mapHandler from '../../util/mapHandler';

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
      mapElName: 'mapCard',
      openedPanels: [],
      initialPoiCatId: null,
      initialPoiId: null
    };
  },

  computed: {
    ...mapState({
      floors: state => state.floor.floors
    }),
    map () {
      return this.$refs.map;
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
    const mapComponent = this.map;

    mapHandler.setI18n(this.$i18n);
    await this.loadFloors();
    mapComponent.loadLayers(this.floors);
    this.loading = false;
    if (this.setSelection) {
      this.selectFloorWithCss(this.setSelection);
    }
    this.$root.$on('poiLoad', this.onPoiLoad);
  },
  methods: {
    ...mapActions({
      loadFloors: 'floor/LOAD_FLOORS'
    }),
    onDrawerClick () {
      this.$emit('onDrawerClick');
    },
    onMenuButtonClick (type) {
      this.map.onMenuButtonClick(type);
    },
    onLocationClick (value) {
      this.map.onLocationClick(value);
    },
    onFloorClick (floor) {
      this.map.onFloorClick(floor);
    },
    onFloorSelect (floor) {
      this.$refs.floorChanger.selectFloorWithCss(floor);
    },
    onSearchSelect (selectedItem) {
      this.map.onSearchSelect(selectedItem);
    },
    onSetGlobalRoute (selectedItem) {
      this.map.setGlobalRoute(selectedItem);
    },
    onRouteGo () {
      this.map.routeGo();
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
    onOpenPoiTree (poiCatId, isPoiId = false) {
      this.drawer = false;
      this.openedPanels = [2];
      if (isPoiId) {
        this.initialPoiId = poiCatId;
      } else {
        this.initialPoiCatId = Number(poiCatId);
      }
    },
    onOpenPoiToPoiRoute (startPoiId, endPoiId) {
      this.map.loadPoiToPoiroute(startPoiId, endPoiId);
    },
    onShowSearchResult (searchResult) {
      this.drawer = true;
      this.openedPanels = [3];
      this.$refs.sideBar.searchResult = searchResult;
    },
    onClearRoute () {
      this.map.clearRouteData();
    },
    onShareClick () {
      this.map.onShareButtonClick(true);
    },
    onPoiLoad (data) {
      this.map.onPoiLoad(data);
    },
    loadSinglePoi (poiId) {
      this.map.loadSinglePoi(poiId);
    }
  }
};
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
