<template>
  <div>
    <campus-search
      :is-route="true"
      icon="mdi-flag"
      ref="fromRoute"
      route-type="from"
      :route-label="startRouteLabel"
      @selectSearhResult="onSearchSelect"
    />
    <campus-search
      :is-route="true"
      icon="mdi-flag-checkered"
      ref="toRoute"
      route-type="to"
      :route-label="endRouteLabel"
      @selectSearhResult="onSearchSelect" />
    <v-checkbox v-model="barrierFree" :label="barrierFreeLabel" />
    <div id="route-description" />
    <v-btn
      color="blue-grey"
      class="white--text"
      @click="onGoButtonClick"
      :disabled="!isRouteAvailable"
      small
    >
      <v-icon left dark>
        mdi-run
      </v-icon>
      <span>{{ goLabel }}!</span>
    </v-btn>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn
          color="blue-grey"
          class="white--text"
          @click="onShareRoute"
          :disabled="!isRouteAvailable"
          small
          v-on="on"
        >
          <v-icon dark>
            mdi-share
          </v-icon>
        </v-btn>
      </template>
      <span>Share Route</span>
    </v-tooltip>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn
          color="blue-grey"
          class="white--text"
          @click="onClearRoute"
          :disabled="!isRouteAvailable"
          small
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
      fromRoute: null,
      toRoute: null
    }
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
      field.stopSearch = true;
      field.searchResult = [data];
      field.model = data;
      this[routeInfo.path + 'Route'] = data;
      this.$emit('setGlobalRoute', {
        data,
        routeType: routeInfo.path
      });
      setTimeout(() => {
        field.stopSearch = false;
      }, 1000);
    }
  }
};
</script>
