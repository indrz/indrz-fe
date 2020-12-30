<template>
  <div>
    <div>
      <v-row no-gutters>
        <v-col :cols="2" class="pa-2">
          <v-app-bar-nav-icon @click.stop="onNavbarClick" />
        </v-col>
        <v-col :cols="8" align-self="center">
          <img id="tu-logo" src="/images/tu-logo.png" alt="tulogo" class="left-bar-logo">
        </v-col>
      </v-row>
    </div>
    <v-expansion-panels v-model="expanded" multiple>
      <v-expansion-panel v-for="menuItem in menuItems" :key="menuItem.title">
        <v-expansion-panel-header>{{ menuItem.title }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <component
            :is="menuItem.type"
            :ref="menuItem.type"
            :initial-poi-cat-id="initialPoiCatId"
            :initial-poi-id="initialPoiId"
            :search-result="searchResult"
            @locationClick="onLocationClick"
            @setGlobalRoute="onSetGlobalRoute"
            @routeGo="onRouteGo"
            @clearRoute="onClearRoute"
            @shareClick="onShareClick"
            @poiLoad="addPoi"
            @loadSinglePoi="loadSinglePoi"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-list
      class="mt-5"
      nav
      dense
    >
      <v-list-item-group color="primary">
        <v-list-item
          v-for="(item, i) in menuButtons"
          :key="i"
          @click.stop="onMenuBUttonClick(item)"
        >
          <v-list-item-icon>
            <v-icon>mdi-{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title v-text="item.text" />
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <div>
      <p class="font-weight-regular caption" style="padding: 8px 16px">
        Powered by <a href="https://www.indrz.com/#contact" target="_blank">www.indrz.com</a>
      </p>
    </div>
  </div>
</template>

<script>
import CampusLocations from './CampusLocations';
import Route from './Route';
import SearchResult from './SearchResult';
import PointsOfInterest from './poi/PointsOfInterest';

export default {
  name: 'SideBar',
  components: {
    CampusLocations,
    Route,
    PointsOfInterest,
    SearchResult
  },
  props: {
    openedPanels: {
      type: Array,
      default: function () {
        return [];
      }
    },
    initialPoiCatId: {
      type: String,
      default: function () {
        return null;
      }
    },
    initialPoiId: {
      type: String,
      default: function () {
        return null;
      }
    }
  },
  data () {
    return {
      locale: {
        campusLocations: this.$t('campus_locations'),
        route: this.$t('route'),
        searchResult: this.$t('search_result'),
        pointsOfInterest: this.$t('points_of_interest'),
        zooToHome: this.$t('zoom_to_home'),
        shareMap: this.$t('share_map'),
        download: this.$t('download'),
        pdf: this.$t('pdf'),
        helpLegendInfos: this.$t('help_legend_infos'),
        aboutTermsConditions: this.$t('about_terms_conditions')
      },
      expanded: [],
      searchResult: []
    }
  },

  computed: {
    menuItems () {
      return [
        {
          type: 'CampusLocations',
          title: this.locale.campusLocations
        },
        {
          type: 'Route',
          title: this.locale.route
        },
        {
          type: 'PointsOfInterest',
          title: this.locale.pointsOfInterest
        }
        /*,
        {
          type: 'SearchResult',
          title: this.locale.searchResult
        }
        */
      ]
    },
    menuButtons () {
      return [
        {
          icon: 'home',
          type: 'zoom-home',
          text: this.locale.zooToHome
        },
        {
          icon: 'share',
          type: 'share-map',
          text: this.locale.shareMap
        },
        {
          icon: 'download',
          type: 'download',
          text: this.locale.download
        },
        {
          icon: 'file-pdf-outline',
          type: 'pdf',
          text: this.locale.pdf
        },
        {
          icon: 'help',
          type: 'help',
          text: this.locale.helpLegendInfos
        },
        {
          icon: 'clipboard-text',
          type: 'terms',
          text: this.locale.aboutTermsConditions
        }
      ]
    }
  },

  watch: {
    openedPanels (value) {
      this.expanded = value;
    }
  },

  methods: {
    onMenuBUttonClick (item) {
      this.$emit('menuButtonClick', item.type);
    },
    onLocationClick (value) {
      this.$emit('locationClick', value);
    },
    onSetGlobalRoute (value) {
      this.$emit('setGlobalRoute', value);
    },
    onRouteGo () {
      this.$emit('routeGo');
    },
    onShareClick () {
      this.$emit('shareClick');
    },
    onClearRoute () {
      this.$emit('clearRoute');
    },
    setRoute (routeInfo) {
      this.$refs.Route[0].setRoute(routeInfo);
    },
    addPoi (data) {
      this.$emit('poiLoad', data);
    },
    loadSinglePoi (poiId) {
      this.$emit('loadSinglePoi', poiId);
    },
    onNavbarClick () {
      this.$emit('hideSidebar');
    }
  }
}
</script>
<style scoped>
  .left-bar-logo {
    width: auto;
    height: 40px;
    left: 10px;
    vertical-align: middle;
    display: block;
    margin: 5px auto;
  }
</style>
