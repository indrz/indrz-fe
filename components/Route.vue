<template>
  <div class="route-room-to-room">
    <campus-search
      ref="fromRoute"
      :is-route="true"
      :route-label="startRouteLabel"
      @selectSearhResult="onSearchSelect"
      @clearClicked="onClearSearchField('from')"
      icon="mdi-flag"
      route-type="from"
      @selectSearhResult="onSearchSelect"
    />
    <campus-search
      ref="toRoute"
      :is-route="true"
      :route-label="endRouteLabel"
      @selectSearhResult="onSearchSelect"
      @clearClicked="onClearSearchField('to')"
      icon="mdi-flag-checkered"
      route-type="to"
      @selectSearhResult="onSearchSelect"
    />
    <v-checkbox v-model="barrierFree" :label="barrierFreeLabel" />
    <div id="route-description" />
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
      <span>{{ goLabel }}!</span>
    </v-btn>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn
          :disabled="!isRouteAvailable"
          color="blue-grey"
          class="white--text"
          small
          @click="onShareRoute"
          v-on="on"
        >
          <v-icon dark>
            mdi-share
          </v-icon>
        </v-btn>
      </template>
      <span>{{ shareRoute }}</span>
    </v-tooltip>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn
          :disabled="!isRouteAvailable"
          color="blue-grey"
          class="white--text"
          small
          @click="onClearRoute"
          v-on="on"
        >
          <v-icon dark>
            mdi-close
          </v-icon>
        </v-btn>
      </template>
      <span>Clear Route</span>
    </v-tooltip>
  </div>
</template>

<script>
import CampusSearch from './CampusSearch';
export default {
  name: 'Route',
  components: {
    CampusSearch
  },
  data () {
    return {
      barrierFree: false,
      startRouteLabel: this.$t('start_route'),
      endRouteLabel: this.$t('end_route'),
      barrierFreeLabel: this.$t('barrier_free_route'),
      goLabel: this.$t('go'),
      shareRoute: this.$t('shareRoute'),
      fromRoute: null,
      toRoute: null
    };
  },
  computed: {
    isRouteAvailable () {
      return this.fromRoute && this.toRoute;
    }
  },
  methods: {
    onSearchSelect (selectedItem) {
      this[selectedItem.routeType + 'Route'] = selectedItem.data;
      this.$emit('setGlobalRoute', selectedItem);
    },
    onGoButtonClick () {
      this.$emit('routeGo');
    },
    onShareRoute () {
      this.$emit('shareClick');
    },
    onClearSearchField (routeType) {
      this[routeType + 'Route'] = null;
    },
    onClearRoute () {
      this.$refs.fromRoute.clearSearch();
      this.fromRoute = null;
      this.toRoute = null;
      this.$refs.toRoute.clearSearch('');
      document.getElementById('route-description').innerHTML = '';
      this.$emit('clearRoute');
    },
    setRoute (routeInfo) {
      const routeData = { ...routeInfo.data };
      if (!routeData.name && routeData.roomcode) {
        routeData.name = routeData.roomcode;
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
      const model = {
        name: data.properties.name,
        floorNum: data.properties.floorNum || data.properties.floor,
        roomCode: data.properties.roomcode,
        code: data.properties.roomcode
      };
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
    }
  }
};
</script>
