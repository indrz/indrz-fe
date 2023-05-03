<template>
  <v-navigation-drawer
    v-model="shouldShowPoiDrawer"
    style="width: 350px"
    fixed
    app
  >
    <div style="ma-2">
      <v-card
        class="mt-4"
        flat
      >
        <v-row justify="center">
          <v-img
            :max-width="350"
            :aspect-ratio="1.52"
            :src="data.images ? `https://tuw-maps.tuwien.ac.at${data.images[0].image}` : '../../images/default_poi_image.png'"
            lazy-src="../../images/default_poi_image.png"
          >
            <template v-slot:placeholder>
              <v-row
                class="fill-height ma-0"
                align="center"
                justify="center"
              >
                <v-progress-circular
                  indeterminate
                  color="primary lighten-1"
                />
              </v-row>
            </template>
            <drawer-search :map="map" :drawer="mainDrawer" @update:drawer="mainDrawer = $event" />
          </v-img>
        </v-row>
        <v-card-text class="mt-5">
          <div>
            <h2>{{ data.name_en }}</h2>
            <template v-if="data.text">
              <p>{{ data.text }}</p>
            </template>
            <template v-else>
              <p><strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
            </template>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                tile
                small
                dark
                color="wu"
                v-on="on"
                @click.stop="onEntranceButtonClick"
              >
                <v-icon left>
                  mdi-routes
                </v-icon>
                {{ locale.entranceButtonText }}
              </v-btn>
            </template>
            <span>{{ locale.entranceButtonTip }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                small
                tile
                dark
                color="wu"
                class="ml-1"
                v-on="on"
                @click.stop="onMetroButtonClick"
              >
                <v-icon left>
                  mdi-routes
                </v-icon>
                {{ locale.metroButtonText }}
              </v-btn>
            </template>
            <span>{{ locale.metroButtonTip }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                color="wu"
                tile
                dark
                small
                class="ml-1"
                @click.stop="onDefiButtonClick"
                v-on="on"
              >
                <v-icon>mdi-heart-flash</v-icon>
              </v-btn>
            </template>
            <span>{{ locale.defiButtonTip }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                color="wu"
                tile
                dark
                small
                class="ml-1"
                @click.stop="onShareButtonClick"
                v-on="on"
              >
                <v-icon>mdi-share-variant</v-icon>
              </v-btn>
            </template>
            <span>{{ locale.shareButtonTip }}</span>
          </v-tooltip>
        </v-card-actions>
      </v-card>
    </div>
  </v-navigation-drawer>
</template>

<script>
import DrawerSearch from './DrawerSearch.vue';
export default {
  name: 'PoiDrawer',
  components: {
    DrawerSearch
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
      locale: {
        entranceButtonText: this.$t('entrance_button_text'),
        entranceButtonTip: this.$t('entrance_button_tip'),
        metroButtonText: this.$t('metro_button_text'),
        metroButtonTip: this.$t('metro_button_tip'),
        defiButtonTip: this.$t('defi_button_tip'),
        shareButtonTip: this.$t('share_button_tip')
      }
    }
  },
  computed: {
    shouldShowPoiDrawer: {
      get: function () {
        return this.show;
      },
      set: function () {
      }
    },
    mainDrawer: {
      get: function () {
        return this.drawer;
      },
      set: function (newValue) {
        this.$emit('update:drawer', newValue);
      }
    }
  },

  methods: {
    onEntranceButtonClick () {
      this.$root.$emit('popupRouteClick', 'from');
      this.$root.$emit('popupEntranceButtonClick');
    },
    onMetroButtonClick () {
      this.$root.$emit('popupRouteClick', 'from');
      this.$root.$emit('popupMetroButtonClick');
    },
    onDefiButtonClick () {
      this.$root.$emit('popupRouteClick', 'from');
      this.$root.$emit('popupDefiButtonClick');
    },
    onShareButtonClick () {
      this.$root.$emit('shareClick');
    }
  }
};
</script>

<style scoped>

</style>
