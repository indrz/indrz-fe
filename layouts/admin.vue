<template>
  <v-app id="admin-app">
    <side-bar
      v-if="isUserSignedIn"
      :menu-items="menuItems"
      :drawer="drawer"
      @drawerClick="onDrawerClick"
    />
    <v-app-bar
      v-if="isUserSignedIn"
      clipped-left
      app
      color="indigo"
      dark
      dense
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>INDRZ MANAGER</v-toolbar-title>
      <v-spacer />
      <user-menu />
    </v-app-bar>
    <v-main>
      <v-container :class="isPoiManager ? 'admin-map-container' : 'pages'">
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
import SideBar from '../components/admin/SideBar';
import UserMenu from '../components/admin/UserMenu';

export default {
  components: {
    SideBar,
    UserMenu
  },
  data: () => ({
    drawer: null,
    menuItems: [
      {
        text: 'Dashboard',
        icon: 'home',
        route: { name: 'dashboard', path: '/admin/' }
      },
      {
        text: 'List shelves',
        icon: 'view-list',
        route: { name: 'shelves', path: '/admin/shelves' }
      },
      {
        text: 'POI Manager',
        icon: 'map-marker',
        route: { name: 'poi', path: '/admin/poi' }
      }
    ]
  }),

  computed: {
    ...mapGetters({
      isUserSignedIn: 'user/isUserSignedIn'
    }),
    isPoiManager () {
      return this.$route.name === 'admin-poi';
    }
  },

  watch: {
    isUserSignedIn: {
      immediate: true,
      handler (value) {
        if (!value) {
          this.$router.push(this.$route.query.redirect || '/admin/login');
        }
      }
    }
  },

  methods: {
    onDrawerClick (drawer) {
      this.drawer = drawer;
    }
  }
};
</script>
<style scoped>
  .admin-map-container {
    align-items: start;
    width: 100%;
    height: 100%;
    padding: 0px !important;
    margin: 0px !important;
    padding: 0px !important;
    max-width: none;
  }
</style>
