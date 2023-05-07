<template>
  <v-navigation-drawer
    v-model="shouldShowPoiDrawer"
    style="width: 350px"
    fixed
    app
  >
    <div v-if="!poiRoute" style="ma-2">
      <v-card
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
            <drawer-search :map="map" :drawer="mainDrawer" class="mt-4" @update:drawer="mainDrawer = $event" />
          </v-img>
        </v-row>
        <v-card-text class=" pa-0">
          <v-tabs
            v-model="activeTabIndex"
            centered
            color="primary"
            icons-and-text
            hide-slider
            class="ma-0"
          >
            <v-tab v-for="(tabInfo, index) in tabs" :key="index" @click="onTabClick(index)">
              {{ tabInfo.text }}
              <v-icon>{{ tabInfo.icon }}</v-icon>
            </v-tab>
          </v-tabs>

          <v-tabs-items v-model="activeTabIndex">
            <v-tab-item>
              <div />
            </v-tab-item>
            <v-tab-item>
              <div class="ma-2">
                <v-row no-gutters>
                  <v-col cols="1">
                    <v-img
                      :width="20"
                      :src="data.icon"
                    />
                  </v-col>
                  <v-col cols="11">
                    <span>{{ data.name_en }}</span>
                  </v-col>
                </v-row>
                <v-row v-if="data.html_content">
                  <v-col>
                    <span v-html="data.html_content" />
                  </v-col>
                </v-row>
                <v-row v-if="data.src === 'wms_campus'">
                  <v-col cols="3">
                    <span>{{ locale.labelBuidingAdress }}</span>
                  </v-col>
                  <v-col cols="9">
                    <span>{{ data.description }}</span>
                    <v-col />
                  </v-col>
                </v-row>
                <template v-if="data.street">
                  <v-row>
                    <v-col cols="3">
                      <span>{{ locale.labelBuidingAdress }}</span>
                    </v-col>
                    <v-col cols="9">
                      <span>{{ data.street }}</span>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="3">
                      <span>{{ locale.labelBuildingCode }}</span>
                    </v-col>
                    <v-col cols="9">
                      <span>{{ data.name }}</span>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="3">
                      <span>{{ locale.labelBuidingPlz }}</span>
                    </v-col>
                    <v-col cols="9">
                      <span>{{ data.postal_code }}</span>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="3">
                      <span>{{ locale.labelBuildingCity }}</span>
                    </v-col>
                    <v-col cols="9">
                      <span>{{ data.city }}</span>
                    </v-col>
                  </v-row>
                </template>
                <v-row v-if="data.room_code">
                  <v-col cols="3">
                    <span>{{ locale.labelRoomCode }}</span>
                  </v-col>
                  <v-col cols="9">
                    <span>{{ data.room_code }}</span>
                    <v-col />
                  </v-col>
                </v-row>
                <v-row v-if="data.floor_name && !data.xy">
                  <v-col cols="3">
                    <span>{{ locale.labelFloorName }}</span>
                  </v-col>
                  <v-col cols="9">
                    <span>{{ data.floor_name }}</span>
                  </v-col>
                </v-row>
                <v-row v-if="data.building_name || data.building">
                  <v-col cols="3">
                    <span>{{ locale.labelBuildingName }}</span>
                  </v-col>
                  <v-col cols="9">
                    <span>{{ data.building_name || data.building }}</span>
                  </v-col>
                </v-row>
                <v-row v-if="data.category_en">
                  <v-col cols="3">
                    <span>{{ locale.labelCategory }}</span>
                  </v-col>
                  <v-col cols="9">
                    <span>{{ data.category_en }}</span>
                    <v-col />
                  </v-col>
                </v-row>
                <v-row v-if="data.nearest_entrance">
                  <v-col cols="3">
                    <span>{{ locale.labelPoiName }}</span>
                  </v-col>
                  <v-col cols="9">
                    <span>{{ data.nearest_entrance }}</span>
                  </v-col>
                </v-row>
                <v-row v-if="data.room_external_id">
                  <v-col cols="3">
                    <span>{{ locale.labelRoomId }}</span>
                  </v-col>
                  <v-col cols="9">
                    <span>{{ data.room_external_id }}</span>
                  </v-col>
                </v-row>
                <v-row v-if="data.capacity">
                  <v-col cols="3">
                    <span>{{ locale.labelCapacity }}</span>
                  </v-col>
                  <v-col cols="9">
                    <span>{{ data.capacity }}</span>
                  </v-col>
                </v-row>
                <template v-if="data.xy">
                  <v-row>
                    <v-col cols="3">
                      <span>X</span>
                    </v-col>
                    <v-col cols="9">
                      <span>{{ data.xy[0].toFixed(3) }}</span>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="3">
                      <span>Y</span>
                    </v-col>
                    <v-col cols="9">
                      <span>{{ data.xy[1].toFixed(3) }}</span>
                    </v-col>
                  </v-row>
                </template>
                <v-divider class="mt-5 mb-5" />
                <v-row no-gutters>
                  <v-col>
                    <v-btn text color="wu" small @click.stop="onRouteClick('from')">
                      <v-icon left>
                        mdi-map-marker
                      </v-icon> {{ locale.routeFromHereText }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <v-btn text color="wu" small @click.stop="onRouteClick('to')">
                      <v-icon left>
                        mdi-map-marker
                      </v-icon> {{ locale.routeToHereText }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <v-btn
                      tile
                      small
                      text
                      color="wu"
                      @click.stop="onEntranceButtonClick"
                    >
                      <v-icon left>
                        mdi-routes
                      </v-icon>
                      {{ locale.entranceButtonText }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <v-btn
                      small
                      tile
                      text
                      color="wu"
                      class="ml-1"
                      @click.stop="onMetroButtonClick"
                    >
                      <v-icon left>
                        mdi-routes
                      </v-icon>
                      {{ locale.metroButtonText }}
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </v-tab-item>
            <v-tab-item>
              <div />
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>
      </v-card>
    </div>
    <div v-if="poiRoute">
      Hello route
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
      poiRoute: false,
      locale: {
        entranceButtonText: this.$t('entrance_button_text'),
        metroButtonText: this.$t('metro_button_text'),
        routeFromHereText: this.$t('route_from_here'),
        routeToHereText: this.$t('route_to_here'),
        labelRoomCode: this.$t('label_room_code'),
        labelFloorName: this.$t('label_floor_name'),
        labelBuildingName: this.$t('label_building_name'),
        labelCategory: this.$t('label_category'),
        labelPoiName: this.$t('label_nearest_entrance'),
        labelRoomId: this.$t('label_room_id'),
        labelCapacity: this.$t('label_capacity'),
        labelBuidingAdress: this.$t('label_building_adress'),
        labelBuildingCode: this.$t('label_building_code'),
        labelBuidingPlz: this.$t('label_building_plz'),
        labelBuildingCity: this.$t('label_building_city')
      },
      tabs: [
        { icon: 'mdi-directions', text: 'Routing' },
        { icon: 'mdi-information', text: 'Info' },
        { icon: 'mdi-share', text: 'Share' }
      ],
      activeTabIndex: 1,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
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
    },
    onRouteClick (path) {
      this.$root.$emit('popupRouteClick', path);
    },
    onTabClick (index) {
      if (index === 2) {
        this.onShareButtonClick()
      } else if (index === 0) {
        this.poiRoute = true;
      }
    }
  }
};
</script>

<style scoped>
  .v-tab {
    font-size: .7rem;
  }
</style>
