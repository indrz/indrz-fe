<template>
  <div id="indrz-popup" :style="{'min-width': popupSize.width}" scrollable title="indrz info" class="ol-popup indrz-popup">
    <div :style="{'max-height': popupSize.height, 'overflow': 'auto'}">
      <a id="popup-closer" @click.stop="onPopupCloseClick" href="#" class="ol-popup-closer" />
      <div id="popup-content" />
      <div id="popup-links">
        <v-row no-gutters>
          <v-col>
            <v-btn @click.stop="onRouteClick('from')" text color="wu" small>
              <v-icon left>
                mdi-map-marker
              </v-icon> {{ locale.routeFromHereText }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <v-btn @click.stop="onRouteClick('to')" text color="wu" small>
              <v-icon left>
                mdi-map-marker
              </v-icon> {{ locale.routeToHereText }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
      <div class="mt-5">
        <v-row :class="{'xs-popup': multiRowButton}" no-gutters align="center" justify="left">
          <div>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  @click.stop="onEntranceButtonClick"
                  tile
                  small
                  dark
                  color="wu"
                >
                  <v-icon left>
                    mdi-routes
                  </v-icon>
                  {{ locale.entranceButtonText }}
                </v-btn>
              </template>
              <span>{{ locale.entranceButtonTip }}</span>
            </v-tooltip>
          </div>
          <div :class="{'ml-1': !multiRowButton, 'mt-1': multiRowButton}">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  @click.stop="onMetroButtonClick"
                  small
                  tile
                  dark
                  color="wu"
                >
                  <v-icon left>
                    mdi-routes
                  </v-icon>
                  {{ locale.metroButtonText }}
                </v-btn>
              </template>
              <span>{{ locale.metroButtonTip }}</span>
            </v-tooltip>
          </div>
          <div :class="{'ml-1': !multiRowButton, 'mt-1': multiRowButton}">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  @click.stop="onDefiButtonClick"
                  v-on="on"
                  color="wu"
                  tile
                  dark
                  small
                >
                  <v-icon>mdi-heart-flash</v-icon>
                </v-btn>
              </template>
              <span>{{ locale.defiButtonTip }}</span>
            </v-tooltip>
          </div>
          <div :class="{'ml-1': !multiRowButton, 'mt-1': multiRowButton}">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  @click.stop="onShareButtonClick"
                  v-on="on"
                  color="wu"
                  tile
                  dark
                  small
                >
                  <v-icon>mdi-share-variant</v-icon>
                </v-btn>
              </template>
              <span>{{ locale.shareButtonTip }}</span>
            </v-tooltip>
          </div>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoOverlay',
  data () {
    return {
      locale: {
        entranceButtonText: this.$t('entrance_button_text'),
        entranceButtonTip: this.$t('entrance_button_tip'),
        metroButtonText: this.$t('metro_button_text'),
        metroButtonTip: this.$t('metro_button_tip'),
        defiButtonTip: this.$t('defi_button_tip'),
        shareButtonTip: this.$t('share_button_tip'),
        routeFromHereText: this.$t('route_from_here'),
        routeToHereText: this.$t('route_to_here')
      }
    }
  },
  computed: {
    popupSize () {
      const size = {
        width: '354px',
        height: '366px'
      };

      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          size.width = '150px';
          size.height = '162px';
          break;
        case 'sm':
          size.width = '270px';
          size.height = '282px';
          break;
      }
      return size;
    },
    multiRowButton () {
      return !!this.$vuetify.breakpoint.smAndDown;
    }
  },
  methods: {
    onPopupCloseClick () {
      this.$emit('closeClick');
    },
    onShareButtonClick () {
      this.$emit('shareClick');
    },
    onRouteClick (path) {
      this.$emit('popupRouteClick', path);
    },
    onEntranceButtonClick () {
      this.$emit('popupRouteClick', 'from');
      this.$emit('popupEntranceButtonClick');
    },
    onMetroButtonClick () {
      this.$emit('popupRouteClick', 'from');
      this.$emit('popupMetroButtonClick');
    },
    onDefiButtonClick () {
      this.$emit('popupRouteClick', 'from');
      this.$emit('popupDefiButtonClick');
    }
  }
};
</script>

<style scoped>
  .xs-popup {
    display: flex;
    flex-direction: column;
    align-items: flex-start !important;
  }
</style>
