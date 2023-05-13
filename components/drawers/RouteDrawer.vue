<template>
  <v-navigation-drawer
    v-model="shouldShowRouteDrawer"
    bottom
    style="width: 275px"
    fixed
    app
  >
    <div style="ma-2">
      <v-container>
        <v-row class="d-flex justify-content-end">
          <v-btn
            icon
            class="ml-auto"
            @click="$emit('on-close')"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
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
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-checkbox v-model="barrierFree" :label="locale.barrierFreeLabel" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div id="route-description" />
          </v-col>
        </v-row>
        <v-divider class="mt-2 mb-2" />
      </v-container>
    </div>
  </v-navigation-drawer>
</template>

<script>
import config from '../../util/indrzConfig';
import CampusSearch from '../CampusSearch.vue';

const { env } = config;

export default {
  name: 'PoiDrawer',
  components: {
    CampusSearch
  },

  props: {
    drawer: {
      type: Boolean,
      default: function () {
        return false;
      }
    },
    show: {
      type: Boolean,
      default: function () {
        return false;
      }
    },
    data: {
      type: Object,
      default: function () {
        return {
          name: ''
        }
      }
    },
    map: {
      type: Object,
      required: true,
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      poiRoute: false,
      barrierFree: false,
      locale: {
        startRouteLabel: this.$t('start_route'),
        endRouteLabel: this.$t('end_route'),
        barrierFreeLabel: this.$t('barrier_free_route')
      }
    }
  },
  computed: {
    shouldShowRouteDrawer: {
      get: function () {
        return this.show;
      },
      set: function () {
      }
    },
    logo () {
      return {
        file: env.LOGO_FILE,
        enabled: (env.LOGO_ENABLED === true)
      };
    }
  },

  methods: {

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
