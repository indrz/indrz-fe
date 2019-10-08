<template>
  <v-app dark>
    <v-navigation-drawer
      v-if="isUserSignedIn"
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      v-if="isUserSignedIn"
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <user-menu />
    </v-app-bar>
    <v-content>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-content>
    <v-footer
      :fixed="fixed"
      app
    >
      <span>&copy; 2019 <a href="https://www.golfgis.com" target="_blank">golfgis.com</a></span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
import UserMenu from '../components/UserMenu';

export default {
  components: {
    UserMenu
  },
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Dashboard',
          to: '/'
        },
        {
          icon: 'mdi-view-list',
          title: 'Tournaments',
          to: '/tournaments'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'GOLFGIS'
    }
  },
  computed: {
    ...mapGetters(
      {
        isUserSignedIn: 'user/isUserSignedIn'
      })
  }
}
</script>
