<template>
  <v-card
    :name="mapElName"
    :ripple="false"
    style="border-radius: 0"
    fluid
    flat
  >
    <poi-drawer
      :show="shouldShowPoiDrawer"
      :data="poiDrawerData"
      :map="currentMap"
      :drawer="drawer"
      @update:drawer="drawer = $event"
      @open-route-drawer="onOpenRouteDrawer"
      @hide-poi-drawer="onHidePoiDrawer"
    />
    <route-drawer
      :show="shouldShowRouteDrawer"
      :data="routeDrawerData"
      :map="currentMap"
      :drawer="drawer"
      @on-close="routeDrawer = false"
      @update:drawer="drawer = $event"
    />
    <v-navigation-drawer
      v-model="drawer"
      bottom
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
      v-show="!shouldShowPoiDrawer"
      :max-width="toolbarWidth"
      dense
      rounded
      floating
      class="ma-2"
    >
      <v-app-bar-nav-icon v-if="!isSmallScreen || !showSearch" @click.stop="drawer = !drawer;" />
      <template v-if="isSmallScreen">
        <v-btn icon @click="showSearch = !showSearch">
          <v-icon v-if="!showSearch">
            mdi-magnify
          </v-icon>
          <v-icon v-if="showSearch">
            mdi-chevron-left
          </v-icon>
        </v-btn>
      </template>
      <v-expand-transition>
        <campus-search
          v-show="!isSmallScreen || showSearch"
          ref="searchComp"
          show-route
          @selectSearhResult="onSearchSelect"
          @showSearch="onShowSearch"
          @open-route-drawer="onOpenRouteDrawer"
        />
      </v-expand-transition>
    </v-toolbar>
    <indrz-map
      ref="map"
      @selectFloor="onFloorSelect"
      @clearSearch="onClearSearch"
      @popupRouteClick="onPopupRouteClick"
      @openPoiTree="onOpenPoiTree"
      @openPoiToPoiRoute="onOpenPoiToPoiRoute"
      @showSearchResult="onShowSearchResult"
      @open-poi-drawer="onOpenPoiDrawer"
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
import PoiDrawer from '@/components/drawers/PoiDrawer';
import RouteDrawer from '@/components/drawers/RouteDrawer.vue';

export default {
  components: {
    Sidebar,
    IndrzMap,
    FloorChanger,
    CampusSearch,
    SnackBar,
    PoiDrawer,
    RouteDrawer
  },
  data () {
    return {
      clipped: false,
      drawer: false,
      poiDrawer: false,
      routeDrawer: false,
      poiDrawerData: {},
      routeDrawerData: {},
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
      initialPoiId: null,
      showSearch: false,
      currentMap: {}
    };
  },

  computed: {
    ...mapState({
      floors: state => state.floor.floors
    }),
    map () {
      return this.$refs.map;
    },
    isSmallScreen () {
      return this.$vuetify.breakpoint.smAndDown;
    },
    toolbarWidth () {
      return this.isSmallScreen ? '280px' : '320px';
    },
    shouldShowPoiDrawer: {
      get () {
        return this.poiDrawer && !this.drawer && !this.routeDrawer;
      },
      set () {
      }
    },
    shouldShowRouteDrawer: {
      get () {
        return this.routeDrawer && !this.poiDrawer && !this.drawer;
      },
      set () {
      }
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
    this.currentMap = mapComponent;
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
    onRouteGo (routeType) {
      this.map.routeGo(routeType);
    },
    onClearSearch () {
      this.$refs.searchComp.clearSearch();
    },
    onPopupRouteClick (routeInfo) {
      this.drawer = true;
      this.openedPanels = [1];
      setTimeout(() => {
        routeInfo?.path && this.$refs.sideBar.setRoute(routeInfo);
      }, 500);
    },
    onOpenPoiTree (poiCatId, isPoiId = false) {
      this.drawer = false;
      this.openedPanels = [2];
      if (isPoiId) {
        this.initialPoiId = poiCatId;
      } else {
        this.initialPoiCatId = poiCatId.split(',').map(id => Number.parseInt(id, 10)).filter(id => !Number.isNaN(id));
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
    },
    onShowSearch () {
      this.showSearch = true;
    },
    onOpenPoiDrawer ({ feature }) {
      this.poiDrawer = !!feature;
      if (this.poiDrawer) {
        this.drawer = false;
        this.routeDrawer = false;
        this.poiDrawerData = feature;
      }
    },
    onOpenRouteDrawer () {
      if (this.routeDrawer) {
        this.routeDrawer = false;
        return;
      }
      this.drawer = false;
      this.poiDrawer = false;
      this.routeDrawer = true;
      this.routeDrawerData = {};
    },
    onHidePoiDrawer () {
      this.poiDrawerData = {};
      this.poiDrawer = false;
    }
  }
};
</script>

<style scoped>
  header {
    position: absolute;
    z-index: 6;
  }
</style>
