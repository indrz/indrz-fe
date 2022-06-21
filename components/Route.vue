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
    />
    <campus-search
      ref="toRoute"
      :is-route="true"
      :route-label="endRouteLabel"
      @selectSearhResult="onSearchSelect"
      @clearClicked="onClearSearchField('to')"
      icon="mdi-flag-checkered"
      route-type="to"
    />
    <v-checkbox v-model="barrierFree" :label="barrierFreeLabel" @change="onBarrierFreeChange" />
    <div id="route-description" />
    <v-btn
      :disabled="!isRouteAvailable"
      @click="onGoButtonClick"
      color="blue-grey"
      class="white--text"
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
          :disabled="!isRouteAvailable"
          @click="onShareRoute"
          v-on="on"
          color="blue-grey"
          class="white--text"
          small
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
          @click="onClearRoute"
          v-on="on"
          color="blue-grey"
          class="white--text"
          small
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
  mounted () {
    this.$root.$on('updateRouteFields', this.setSearchFieldRouteText);
  },
  methods: {
    onSearchSelect (selectedItem) {
      if (!selectedItem) {
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
      const { properties } = data;
      const model = { ...properties, ...{ floorNum: properties.floor_num, roomCode: properties.roomcode } };

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
<style lang="scss" scoped>
  #route-description {
    margin-bottom: 10px;
  }
</style>
