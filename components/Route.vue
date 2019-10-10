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
    <v-btn
      color="blue-grey"
      class="ma-2 white--text"
      @click="onGoButtonClick"
      :disabled="!isRouteAvailable"
    >
      <v-icon left dark>
        mdi-run
      </v-icon>
      <span>{{ goLabel }}!</span>
    </v-btn>
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
    }
  }
};
</script>
