<template>
  <expansion-container :title="getTitle">
    <v-text-field
        hide-details
        prepend-icon="mdi-flag"
        single-line
        solo
        flat
        :label="startRouteLabel"
      />
      <v-text-field
        hide-details
        prepend-icon="mdi-flag-checkered"
        single-line
        solo
        flat
        :label="startRouteLabel"
      />
      <v-checkbox v-model="barrierFree" :label="barrierFreeLabel"></v-checkbox>
      <v-btn
        color="blue-grey"
        class="ma-2 white--text"
      >
        <v-icon left dark>mdi-run</v-icon>
        <span>{{goLabel}}!</span>
      </v-btn>
  </expansion-container>
</template>

<script>
import ExpansionContainer from './base/ExpansionContainer';

export default {
  name: 'Route',
  components: {
    ExpansionContainer
  },
  data () {
    return {
      startRouteLabel: this.$t('start_route'),
      endRouteLabel: this.$t('end_route'),
      barrierFreeLabel: this.$t('barrier_free_route'),
      goLabel: this.$t('go')
    }
  },
  computed: {
    getTitle () {
      return this.$t('route');
    }
  }
};
</script>
