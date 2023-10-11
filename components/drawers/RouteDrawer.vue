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
    <div v-if="isMobile" class="draggable-handle" style="mb-2" @mousedown="startDrag" @touchstart="startDrag" />
    <div style="ma-2">
      <v-container justify="center" class="pa-0" style="margin-top: 20px; max-width: 410px">
        <v-row class="ma-0" justify="center">
          <v-chip>{{ locale.routeLabel }}</v-chip>
          <v-btn icon @click="$emit('on-close')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-row>
          <v-col :cols="8" align-self="center">
            <img id="tu-logo" :src="logo.file" alt="logo" class="left-bar-logo">
          </v-col>
        </v-row>
        <div class="row justify-left ml-5">
          <div class="panel-section-items">
            <v-list class="list-label-value" style="height: 120px;">
              <v-list-item>
                <campus-search
                  ref="fromRoute"
                  :is-route="true"
                  :route-label="locale.startRouteLabel"
                  icon="mdi-flag"
                  route-type="from"
                  @selectSearhResult="onSearchSelect"
                  @clearClicked="onClearSearchField('from')"
                />
              </v-list-item>
              <v-list-item>
                <campus-search
                  ref="toRoute"
                  :is-route="true"
                  :route-label="locale.endRouteLabel"
                  icon="mdi-flag-checkered"
                  route-type="to"
                  @selectSearhResult="onSearchSelect"
                  @clearClicked="onClearSearchField('to')"
                />
              </v-list-item>
            </v-list>
            <v-list class="list-label-value">
              <v-list-item>
                <v-checkbox v-model="barrierFree" :label="locale.barrierFreeLabel" @change="onBarrierFreeChange" />
              </v-list-item>
            </v-list>
          </div>
        </div>
        <v-divider v-if="routeInfo" class="mt-5 mb-5" />
        <div v-if="routeInfo" class="row justify-center">
          <div class="panel-section-items">
            <v-list class="list-label-value">
              <v-list-item v-if="routeInfo?.walk_time">
                <span class="primary--text text-h5 font-weight-bold text-center">{{ routeInfo.walk_time }} ({{ routeInfo.route_length }} m)</span>
              </v-list-item>
              <v-list-item v-if="routeInfo?.start_name">
                <v-icon class="search-btn">
                  mdi-flag
                </v-icon> <span>{{ locale.startRouteLabel }} : {{ routeInfo.start_name }}</span>
              </v-list-item>
              <v-list-item v-if="routeInfo?.passes">
                <v-icon class="search-btn">
                  mdi-map-marker
                </v-icon> <span>{{ locale.routePassessLabel }} </span>
              </v-list-item>
              <v-list-item v-if="routeInfo?.end_name">
                <v-icon class="search-btn">
                  mdi-flag-checkered
                </v-icon> <span>{{ locale.endRouteLabel }} : {{ routeInfo.end_name }}</span>
              </v-list-item>
            </v-list>
          </div>
        </div>
        <div v-if="noRouteFound || error" class="row justify-left ml-5">
          <div class="panel-section-items">
            <v-list class="list-label-value">
              <v-list-item v-if="noRouteFound">
                <span style="color: red">
                  {{ locale.noRouteFoundText }}
                </span>
              </v-list-item>
              <v-list-item v-if="error">
                <span style="color: red">
                  {{ error }}
                </span>
              </v-list-item>
            </v-list>
          </div>
        </div>
        <v-divider class="mt-5 mb-5" />
        <div class="row justify-left ml-5">
          <div class="panel-section-items">
            <v-list class="list-label-value">
              <v-list-item>
                <v-btn
                  :disabled="!isRouteAvailable"
                  color="blue-grey"
                  class="white--text"
                  small
                  @click="onGoButtonClick"
                >
                  <v-icon left dark>
                    mdi-run
                  </v-icon>
                  <span>{{ locale.goLabel }}!</span>
                </v-btn>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :disabled="!isRouteAvailable"
                      color="blue-grey"
                      class="white--text ml-1"
                      small
                      @click="onShareRoute"
                      v-on="on"
                    >
                      <v-icon dark>
                        mdi-share
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>{{ locale.shareRoute }}</span>
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :disabled="!isRouteAvailable"
                      color="blue-grey"
                      class="white--text ml-1"
                      small
                      @click="onClearRoute"
                      v-on="on"
                    >
                      <v-icon dark>
                        mdi-close
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>{{ locale.clearRouteLabel }}</span>
                </v-tooltip>
              </v-list-item>
            </v-list>
          </div>
        </div>
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
  name: 'RouteDrawer',
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
        startRouteLabel: this.$t('route_from_here'),
        endRouteLabel: this.$t('route_to_here'),
        clearRouteLabel: this.$t('clear_route'),
        routePassessLabel: this.$t('route_passess'),
        barrierFreeLabel: this.$t('barrier_free_route'),
        routeLabel: this.$t('route'),
        noRouteFoundText: this.$t('no_route_found'),
        shareRoute: this.$t('shareRoute'),
        goLabel: this.$t('go')
      },
      routeInfo: null,
      noRouteFound: false,
      error: null
    }
  },
  computed: {
    logo () {
      return {
        file: env.LOGO_FILE,
        enabled: (env.LOGO_ENABLED === true)
      };
    },
    isRouteAvailable () {
      return this.fromRoute && this.toRoute;
    }
  },

  mounted () {
    this.$root.$on('setRoute', this.setRoute);
    this.$root.$on('setRouteInfo', this.setRouteInfo);
    this.$root.$on('noRouteFound', this.setNoRouteFound);
    this.$root.$on('routeError', this.setRouteError);
    this.$root.$on('updateRouteFields', this.setSearchFieldRouteText)
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

      if (this.fromRoute && this.toRoute) {
        this.onGoButtonClick();
      }
    },
    onGoButtonClick () {
      this.$emit('routeGo', this.barrierFree ? 1 : 0);
    },
    onShareRoute () {
      this.$root.$emit('shareClick', true);
    },
    onClearSearchField (routeType) {
      this[routeType + 'Route'] = null;
      this.setRouteError(null);
      this.$root.$emit('clearRoute')
    },
    onClearRoute () {
      this.$refs.fromRoute.clearSearch();
      this.fromRoute = null;
      this.toRoute = null;
      this.$refs.toRoute.clearSearch('');
      this.setRouteError(null);
      this.$root.$emit('clearRoute')
    },
    clearMessages () {
      this.routeInfo = null;
      this.error = null;
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
      const model = { ...properties, ...{ floorNum: properties.floor_num || properties.floor, roomCode: properties.room_code } };

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
      this.clearMessages();
      if (!routeInfo) {
        this.setNoRouteFound(true)
        return;
      }
      this.setNoRouteFound(false)
      const routeTime = routeInfo.walk_time;
      const minutes = Math.floor(routeTime / 60);
      const seconds = routeTime - minutes * 60;
      const mins = 'minutes';
      const secs = 'seconds';
      const walkTimeString = minutes + ' ' + mins + ' ' + Math.floor(seconds) + ' ' + secs;

      this.routeInfo = { ...routeInfo, walk_time: walkTimeString };
    },
    setNoRouteFound (state = true) {
      this.noRouteFound = state
      state && this.clearMessages()
    },
    setRouteError (error) {
      this.error = error;
      this.setNoRouteFound(false)
      this.routeInfo = null
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
