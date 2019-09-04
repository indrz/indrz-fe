<template>
    <v-card
    class="fill-height"
    fluid
    flat
    width="100%"
    img="https://cdn.vuetifyjs.com/images/toolbar/map.jpg"
  >
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <sidebar :menuItems="items" />
    </v-navigation-drawer>
    <v-toolbar
      dense
      floating
      class="ma-4"
      max-width="320px"
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-text-field
        hide-details
        prepend-icon="mdi-magnify"
        single-line
        solo
        label="Search our campus"
      />
      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
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
