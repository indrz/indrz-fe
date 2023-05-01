<template>
  <v-navigation-drawer
    v-model="shouldShowPoiDrawer"
    style="width: 350px"
    fixed
    app
  >
    <div style="ma-2">
      <v-card
        class="mt-4"
        flat
      >
        <drawer-search :map="map" :drawer="mainDrawer" @update:drawer="mainDrawer = $event" />
        <v-card-text class="mt-5">
          <div>
            <h2>{{ data.name }}</h2>
            <p><strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
          </div>
        </v-card-text>
      </v-card>
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
  }
};
</script>

<style scoped>

</style>
