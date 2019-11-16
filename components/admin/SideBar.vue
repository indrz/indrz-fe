<template>
  <v-navigation-drawer v-model="drawerState" app>
    <v-list dense>
      <v-list-item
        v-for="menuItem in menuItems"
        :key="menuItem.text"
        @click="onMenuItemClick(menuItem.route)"
      >
        <v-list-item-action>
          <v-icon>mdi-{{ menuItem.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ menuItem.text }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'SideBar',
  components: {
  },
  props: {
    drawer: {
      type: Boolean,
      default: false
    },
    menuItems: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  computed: {
    drawerState: {
      get () {
        return this.drawer;
      },
      set (value) {
        this.$emit('drawerClick', value);
      }
    },
    showPoi () {
      return this.$route.name === 'admin-poi';
    }
  },
  methods: {
    onMenuItemClick (route) {
      if (route && route.path && route.path !== this.$route.path) {
        this.$router.push(route.path);
      }
    }
  }
}
</script>

<style scoped>

</style>
