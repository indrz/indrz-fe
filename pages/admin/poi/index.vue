<template>
  <div class="poi-page">
    <v-container pa-15>
      <v-row
        class="fill-height"
        align="center"
        justify="center"
      >
        <template v-for="(menuItem, i) in menuItems">
          <v-col
            :key="i"
            cols="12"
            md="4"
          >
            <v-hover v-slot="{ hover }">
              <v-card
                :elevation="hover ? 12 : 2"
                :class="{ 'on-hover': hover }"
                @click="onPoiMenuClick(menuItem.route)"
              >
                <v-card-title class="justify-center">
                  {{ menuItem.text }}
                </v-card-title>
              </v-card>
            </v-hover>
          </v-col>
        </template>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'PoiIndex',
  layout: 'admin',
  data: function () {
    return {
      menuItems: [
        {
          text: 'POI Editor',
          route: { name: 'poi-editor', path: '/admin/poi/editor' }
        },
        {
          text: 'POI Categories',
          route: { name: 'poi-categories', path: '/admin/poi/categories' }
        },
        {
          text: 'POI Icons',
          route: { name: 'poi-icons', path: '/admin/poi/icons' }
        }
      ]
    }
  },
  methods: {
    onPoiMenuClick (route) {
      if (route && route.path && route.path !== this.$route.path) {
        this.$router.push(route.path);
      }
    }
  }
}
</script>

<style scoped>
  .poi-page {
    height: 100%;
    width: 100%;
    background-image: url("/images/poi-editor-background.jpeg");
    background-repeat: repeat;
  }
</style>
