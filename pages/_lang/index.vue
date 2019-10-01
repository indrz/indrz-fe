<template>
  <v-card
    class="fill-height"
    fluid
    flat
    :name="mapElName"
    width="100%"
    style="border-radius: 0"
    :ripple="false"
    @click.stop="onMapClick($event)"
  >
    <v-navigation-drawer
      v-model="drawer"
      absolute
      bottom
      temporary
      app
    >
      <sidebar
        :menu-items="items"
        @menuButtonClick="onMenuButtonClick"
        @locationClick="onLocationClick"
      />
    </v-navigation-drawer>
    <v-toolbar
      dense
      floating
      class="ma-2"
      max-width="320px"
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-autocomplete
        v-model="model"
        :items="searchResult"
        :loading="isLoading"
        :search-input.sync="search"
        item-text="properties.name"
        item-value="properties.spaceid"
        append-icon="mdi-magnify"
        :no-data-text="noResultText"
        single-line
        return-object
        solo
        flat
        hide-selected
        hide-details
        hide-no-data
        :label="searchLabel"
      />
    </v-toolbar>
    <indrz-map ref="map" @selectFloor="onFloorSelect" />
    <floor-changer ref="floorChanger" :floors="floors" @floorClick="onFloorClick" />
  </v-card>
</template>

<script>
import IndrzMap from '../../components/IndrzMap';
import Sidebar from '../../components/Sidebar';
import FloorChanger from '../../components/FloorChanger';
import api from '../../util/api';

export default {
  components: {
    Sidebar,
    IndrzMap,
    FloorChanger
  },
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      floors: [],
      loading: true,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Home',
          to: '/'
        }
      ],
      picker: new Date().toISOString().substr(0, 10),
      searchLabel: this.$t('search_our_campus'),
      miniVariant: false,
      mapId: 'mapContainer',
      map: null,
      mapElName: 'mapCard',
      noResultText: 'No result found',
      serachItemLimit: 100,
      searchResult: [],
      isLoading: false,
      model: null,
      search: null
    }
  },
  watch: {
    search (val) {
      if (val.length < 3) {
        return;
      }
      if (this.isLoading) {
        return
      }
      this.isLoading = true;

      api.request({
        endPoint: 'search/' + val
      })
        .then((response) => {
          this.searchResult = response.data.features.filter(feature => feature.properties && feature.properties.name);
          if (this.searchResult.length > 100) {
            this.searchResult = this.searchResult.slice(0, this.serachItemLimit);
          }
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => (this.isLoading = false));
    }
  },

  async mounted () {
    const floorData = await this.fetchFloors();
    if (floorData && floorData.data && floorData.data.results) {
      this.floors = floorData.data.results;
      this.$refs.map.loadLayers(this.floors);
    }
    this.loading = false;
    if (this.setSelection) {
      this.selectFloorWithCss(this.setSelection);
    }
  },
  methods: {
    fetchFloors () {
      return api.request({
        endPoint: 'floor'
      });
    },
    onDrawerClick () {
      this.$emit('onDrawerClick')
    },
    onMapClick (e) {
      if (e.target.getAttribute('name') !== this.mapElName) {
        return;
      }
      console.log('Map Event');
    },
    onMenuButtonClick (type) {
      this.$refs.map.onMenuButtonClick(type);
    },
    onLocationClick (value) {
      this.$refs.map.onLocationClick(value);
    },
    onFloorClick (floor) {
      this.$refs.map.onFloorClick(floor);
    },
    onFloorSelect (floor) {
      this.$refs.floorChanger.setSelection = floor;
    }
  }
}
</script>

<style scoped>
  header {
    position: absolute;
    z-index: 100;
  }
  nav {
    z-index: 101
  }
</style>
