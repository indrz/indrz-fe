<template>
    <v-card
    class="fill-height"
    fluid
    flat
    width="100%"
    img="https://cdn.vuetifyjs.com/images/toolbar/map.jpg"
    style="border-radius: 0"
  >
    <v-navigation-drawer
      v-model="drawer"
      absolute
      bottom
      temporary
      app
    >
      <sidebar :menuItems="items" />
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
        label="Search our campus"
      />
    </v-toolbar>
  </v-card>

</template>

<script>
import Sidebar from '../components/Sidebar'

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
      miniVariant: false
    }
  },
  methods: {
    onDrawerClick () {
      this.$emit('onDrawerClick')
    }
  }
}
</script>
