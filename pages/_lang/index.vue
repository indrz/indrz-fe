<template>
  <v-card
    class="fill-height"
    fluid
    flat
    :name="mapElName"
    width="100%"
    img="https://cdn.vuetifyjs.com/images/toolbar/map.jpg"
    style="border-radius: 0"
    @click.stop="onMapClick($event)"
    :ripple="false"
  >
    <v-navigation-drawer
      v-model="drawer"
      absolute
      bottom
      temporary
      app
    >
      <sidebar :menu-items="items" />
    </v-navigation-drawer>
    <v-toolbar
      dense
      floating
      class="ma-2"
      max-width="320px"
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-text-field
        hide-details
        append-icon="mdi-magnify"
        single-line
        solo
        flat
        :label="searchLabel"
      />
    </v-toolbar>
  </v-card>
</template>

<script>
import Sidebar from '../../components/Sidebar'

export default {
  components: {
    Sidebar
  },
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
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
      mapElName: 'mapCard'
    }
  },
  methods: {
    onDrawerClick () {
      this.$emit('onDrawerClick')
    },
    onMapClick (e) {
      if (e.target.getAttribute('name') !== this.mapElName) {
        return;
      }
      console.log('Map Event');
    }
  }
}
</script>
