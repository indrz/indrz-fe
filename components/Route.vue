<template>
  <div>
    <v-text-field
      hide-details
      prepend-icon="mdi-flag"
      single-line
      flat
      :label="startRouteLabel"
    />
    <v-text-field
      hide-details
      prepend-icon="mdi-flag-checkered"
      single-line
      flat
      :label="endRouteLabel"
    />
    <v-checkbox v-model="barrierFree" :label="barrierFreeLabel" />
    <v-btn
      color="blue-grey"
      class="ma-2 white--text"
    >
      <v-icon left dark>
        mdi-run
      </v-icon>
      <span>{{ goLabel }}!</span>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'Route',
  data () {
    return {
      startRouteLabel: this.$t('start_route'),
      endRouteLabel: this.$t('end_route'),
      barrierFreeLabel: this.$t('barrier_free_route'),
      goLabel: this.$t('go')
    }
  }
};
</script>
