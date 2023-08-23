<template>
  <v-navigation-drawer
    ref="drawer"
    v-model="shouldShowDrawer"
    class="resizable"
    bottom
    :style="{ width: '410px', height: drawerHeight + 'px' }"
    fixed
    app
    @transitionend="onTransitionEnd"
  >
    <div v-if="isMobile" class="draggable-handle" style="mb-2" @mousedown="startDrag" />
    <div style="ma-2">
      <v-container justify="center" class="pa-0" style="margin-top: 20px; max-width: 410px">
        <v-row class="ma-0">
          <v-img
            :max-width="410"
            :aspect-ratio="1.52"
            :src="'../../images/default_poi_image.png'"
            lazy-src="../../images/default_poi_image.png"
          >
            <v-btn
              icon
              class="ml-auto"
              @click="$emit('on-close')"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-img>
        </v-row>
        <v-row>
          <v-col :cols="8" align-self="center">
            <img id="tu-logo" :src="logo.file" alt="logo" class="left-bar-logo">
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <campus-search
              ref="fromRoute"
              :is-route="true"
              :route-label="locale.startRouteLabel"
              icon="mdi-flag"
              route-type="from"
              @selectSearhResult="onSearchSelect"
              @clearClicked="onClearSearchField('from')"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <campus-search
              ref="toRoute"
              :is-route="true"
              :route-label="locale.endRouteLabel"
              icon="mdi-flag-checkered"
              route-type="to"
              @selectSearhResult="onSearchSelect"
              @clearClicked="onClearSearchField('to')"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-checkbox v-model="barrierFree" :label="locale.barrierFreeLabel" @change="onBarrierFreeChange" />
          </v-col>
        </v-row>
        <v-divider class="mt-2 mb-2" />
        <v-row v-if="routeInfo?.walk_time">
          <v-col cols="12" class="d-flex justify-center align-center">
            <span class="primary--text text-h5 font-weight-bold text-center">{{ routeInfo.walk_time }} ({{ routeInfo.route_length }} m)</span>
          </v-col>
        </v-row>
        <v-row v-if="routeInfo?.start_name">
          <v-col>
            <v-icon class="search-btn">
              mdi-flag
            </v-icon> <span>Start: {{ routeInfo.start_name }}</span>
          </v-col>
        </v-row>
        <v-row v-if="routeInfo?.start_name">
          <v-col>
            <v-icon class="search-btn">
              mdi-map-marker
            </v-icon> <span>Passes </span>
          </v-col>
        </v-row>
        <v-row v-if="routeInfo?.end_name">
          <v-col>
            <v-icon class="search-btn">
              mdi-flag-checkered
            </v-icon> <span>Destinamtion: {{ routeInfo.end_name }}</span>
          </v-col>
        </v-row>
        <!-- <v-row>
          <v-col>
            <div id="route-description" />
          </v-col>
        </v-row> -->
      </v-container>
    </div>
  </v-navigation-drawer>
</template>

<script>
import config from '../../util/indrzConfig';
import CampusSearch from '../CampusSearch.vue';
import BaseDrawer from './BaseDrawer';

const { env } = config;

export default {
  name: 'PoiDrawer',
  components: {
    CampusSearch
  },
  mixins: [BaseDrawer],
  data () {
    return {
      poiRoute: false,
      barrierFree: false,
      fromRoute: null,
      toRoute: null,
      locale: {
        startRouteLabel: this.$t('start_route'),
        endRouteLabel: this.$t('end_route'),
        barrierFreeLabel: this.$t('barrier_free_route')
      },
      routeInfo: {}
    }
  },
  computed: {
    logo () {
      return {
        file: env.LOGO_FILE,
        enabled: (env.LOGO_ENABLED === true)
      };
    }
  },

  mounted () {
    this.$root.$on('setRoute', this.setRoute);
    this.$root.$on('setRouteInfo', this.setRouteInfo)
  },

  methods: {
    onSearchSelect (selectedItem) {
      if (!selectedItem || !selectedItem.data) {
        return;
      }
      const currentSelection = { ...selectedItem };
      const { id, properties } = selectedItem.data;

      if (!properties.space_id && properties.spaceid) {
        properties.space_id = properties.spaceid;
      } else if (!properties.space_id && id) {
        properties.space_id = id;
      } else if (properties.shelfId) {
        properties.coords = currentSelection.data.geometry.coordinates;
      }
      this[selectedItem.routeType + 'Route'] = currentSelection.data;
      this.$emit('setGlobalRoute', selectedItem);
    },
    onGoButtonClick () {
      this.$emit('routeGo', this.barrierFree ? 1 : 0);
    },
    onShareRoute () {
      this.$emit('shareClick');
    },
    onClearSearchField (routeType) {
      this[routeType + 'Route'] = null;
      this.clearRoute();
    },
    onClearRoute () {
      this.$refs.fromRoute.clearSearch();
      this.fromRoute = null;
      this.toRoute = null;
      this.$refs.toRoute.clearSearch('');
      this.clearRoute();
    },
    clearRoute () {
      document.getElementById('route-description').innerHTML = '';
      this.$emit('clearRoute');
    },
    onBarrierFreeChange () {
      if (this.fromRoute && this.toRoute) {
        this.onGoButtonClick();
      }
    },
    setSearchFieldRouteText (routeInfo) {
      const fieldExtensions = ['from', 'to'];
      fieldExtensions.forEach((extension) => {
        const field = this.$refs[extension + 'Route'];
        const model = { ...field.model || {}, ...routeInfo[extension + 'Data'] };

        field.stopSearch = true;
        field.searchResult = [model];
        field.model = model;
        setTimeout(() => {
          field.stopSearch = false;
        }, 1000);
      });
    },
    setRoute (routeInfo) {
      const routeData = { ...routeInfo.data };
      if (!routeData.name && routeData.room_code) {
        routeData.name = routeData.room_code;
      }
      if (!routeData.space_id && routeData.spaceid) {
        routeData.space_id = routeData.spaceid;
      }
      if (!routeData.space_id && routeData.id) {
        routeData.space_id = routeData.id;
      }
      const data = {
        properties: routeData,
        type: 'Feature',
        geometry: {}
      };
      const field = this.$refs[routeInfo.path + 'Route'];
      if (!field) {
        return;
      }
      const { properties } = data;
      const model = { ...properties, ...{ floorNum: properties.floor_num, roomCode: properties.room_code } };

      field.stopSearch = true;
      field.apiResponse = [data];
      field.searchResult = [model];
      field.model = model;
      this[routeInfo.path + 'Route'] = data;
      this.$emit('setGlobalRoute', {
        data,
        routeType: routeInfo.path
      });

      setTimeout(() => {
        field.stopSearch = false;
        if (this.fromRoute && this.toRoute) {
          this.onGoButtonClick();
        }
      }, 1000);
    },

    setRouteInfo (routeInfo) {
      this.setSearchFieldRouteText({
        fromData: {
          name: routeInfo.start_name
        },
        toData: {
          name: routeInfo.end_name
        }
      })
      const routeTime = routeInfo.walk_time;
      const minutes = Math.floor(routeTime / 60);
      const seconds = routeTime - minutes * 60;
      const mins = 'minutes';
      const secs = 'seconds';
      const walkTimeString = minutes + ' ' + mins + ' ' + Math.floor(seconds) + ' ' + secs;

      this.routeInfo = { ...routeInfo, walk_time: walkTimeString };
    }
  }
};
</script>

<style scoped>
.left-bar-logo {
    width: auto;
    height: 40px;
    left: 10px;
    display: block;
    margin: 5px auto;
  }
</style>
