<template>
  <v-card
    :name="mapElName"
    :ripple="false"
    style="border-radius: 0"
    fluid
    flat
  >
    <v-navigation-drawer
      v-model="shouldShowPoiDrawer"
      style="width: 350px"
      fixed
      app
    >
      <div style="ma-2">
        <v-card
          class="mt-4"
          flat
        >
          <v-card-title>
            <v-toolbar
              :max-width="toolbarWidth"
              dense
              rounded
              floating
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
                <campus-search v-show="!isSmallScreen || showSearch" ref="searchComp" @selectSearhResult="onSearchSelect" @showSearch="onShowSearch" />
              </v-expand-transition>
            </v-toolbar>
          </v-card-title>
          <v-card-text class="mt-5">
            <div>
              <h2>{{ poiDrawerData.name }}</h2>
              <p><strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-navigation-drawer>
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
        <campus-search v-show="!isSmallScreen || showSearch" ref="searchComp" @selectSearhResult="onSearchSelect" @showSearch="onShowSearch" />
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
      poiDrawer: false,
      poiDrawerData: {},
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
      showSearch: false
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
      return this.$vuetify.breakpoint.mdAndDown;
    },
    toolbarWidth () {
      return this.isSmallScreen ? '280px' : '320px';
    },
    shouldShowPoiDrawer: {
      get () {
        return this.poiDrawer && !this.drawer;
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
        this.$refs.sideBar.setRoute(routeInfo);
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
      // console.log(feature)
      this.poiDrawer = !!feature;
      if (this.poiDrawer) {
        this.drawer = false;
        this.poiDrawerData = feature;
      }
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
