<template>
  <v-navigation-drawer
    ref="drawer"
    v-model="shouldShowDrawer"
    class="resizable"
    bottom
    :style="{ width: '410px', height: drawerHeight + 'px' }"
    fixed
    app
    @transitionend="onTransitionEnd"
  >
    <div v-if="isMobile" class="draggable-handle" style="mb-2" @mousedown="startDrag" />
    <div v-if="!poiImages" style="ma-2">
      <v-card
        flat
        style="margin-top: 20px"
      >
        <v-row justify="center">
          <v-img
            :max-width="410"
            :aspect-ratio="1.52"
            :src="data.images ? `${baseUrl}${data.images[0].image}` : '../../images/default_poi_image.png'"
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
            <drawer-search
              :map="baseMap"
              :drawer="mainDrawer"
              :search-title="searchTitle"
              class="mt-4"
              @update:drawer="mainDrawer = $event"
              @hide-poi-drawer="onHidePoiDrawer()"
            />
            <div
              v-if="data?.images?.length"
              class="image-button"
            >
              <v-btn
                class="ma-2"
                color="rgba(0,0,0,0.4)"
                dark
                tonal
                @click="poiImages = !poiImages"
              >
                <v-icon dark left>
                  mdi-folder-multiple-image
                </v-icon>
                {{ data.images.length }} - {{ locale.labelPoiPictures }}
              </v-btn>
            </div>
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

          <v-tabs-items v-model="activeTabIndex" class="row justify-center ma-0">
            <v-tab-item>
              <div />
            </v-tab-item>
            <v-tab-item>
              <div style="width: 410px">
                <v-row no-gutters>
                  <v-col cols="1" class="title-items">
                    <v-img
                      v-if="data.icon"
                      :max-width="20"
                      :src="data.icon"
                    />
                    <v-img
                      v-if="data.src_icon"
                      :src="getIconUrl(data.src_icon)"
                      contain
                      max-height="24"
                      max-width="24"
                    />
                  </v-col>
                  <v-col cols="11" class="title-items">
                    <span class="primary--text subtitle-1">{{ searchTitle }}</span>
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

    <div v-if="poiImages">
      <v-container>
        <v-row no-gutters>
          <v-col cols="2">
            <v-btn
              icon
              @click="poiImages = !poiImages"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="1" class="title-items">
            <v-img
              :max-width="20"
              :src="data.icon"
            />
          </v-col>
          <v-col cols="9" class="title-items">
            <span class="primary--text subtitle-1">{{ data.name_en }}</span>
          </v-col>
        </v-row>
        <v-row v-for="(image, index) in data.images" :key="index" justify="center">
          <v-img
            :max-width="410"
            :aspect-ratio="1.52"
            :src="`${baseUrl}${image.image}`"
            lazy-src="../../images/default_poi_image.png"
            class="gallery-thumb"
            @click="onGalleryImageClick(index)"
          />
        </v-row>
      </v-container>
    </div>
    <photo-gallery :show="showGallery" :images="data.images" :selcted-index="galleryImageIndex" @gallery:show="showGallery=$event" />
  </v-navigation-drawer>
</template>

<script>
import config from '../../util/indrzConfig';
import CampusSearch from '../CampusSearch.vue';
import PhotoGallery from '../PhotoGallery';
import DrawerSearch from './DrawerSearch.vue';
import BaseDrawer from './BaseDrawer';

const { env } = config;

export default {
  name: 'PoiDrawer',
  components: {
    CampusSearch,
    DrawerSearch,
    PhotoGallery
  },
  mixins: [BaseDrawer],
  data () {
    return {
      poiImages: false,
      showGallery: false,
      galleryImageIndex: 0,
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
        labelBuildingCity: this.$t('label_building_city'),
        labelPoiPictures: this.$t('poi_pictures')
      },
      tabs: [
        { icon: 'mdi-directions', text: 'Routing' },
        { icon: 'mdi-information', text: 'Info' },
        { icon: 'mdi-share', text: 'Share' }
      ],
      activeTabIndex: 1,
      iconNames: ['book', 'department', 'person', 'poi', 'space'],
      iconPath: '/images/icons/search/'
    }
  },
  computed: {
    logo () {
      return {
        file: env.LOGO_FILE,
        enabled: (env.LOGO_ENABLED === true)
      };
    },
    baseUrl () {
      return env.BASE_URL
    },
    searchTitle () {
      const { data } = this;
      return data.name_en || data.name;
    }
  },
  watch: {
    data () {
      this.poiImages = false;
      this.activeTabIndex = 1;
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
        this.$emit('open-route-drawer');
      }
    },
    onGalleryImageClick (index = 0) {
      this.galleryImageIndex = index;
      this.showGallery = !this.showGallery;
    },
    getIconUrl (iconName) {
      if (!iconName) {
        return '';
      }
      if (this.iconNames.includes(iconName)) {
        return `${this.iconPath}/${iconName}.png`;
      } else if (iconName.includes('.png')) {
        return `${iconName}`
      }
      return `${this.iconPath}/poi.png`;
    },
    onHidePoiDrawer () {
      this.$root.$emit('closeInfoPopup');
      this.$emit('hide-poi-drawer');
    }
  }
};
</script>

<style lang="scss" scoped>
.image-button {
  position: absolute;
  bottom: 10px;
}
.left-bar-logo {
    width: auto;
    height: 40px;
    left: 10px;
    vertical-align: middle;
    display: block;
    margin: 5px auto;
  }
  .v-tab {
    font-size: .7rem;
  }
  .title-items {
    display: flex;
    align-items: center;
  }
  .gallery-thumb {
    cursor: pointer;
  }
</style>
