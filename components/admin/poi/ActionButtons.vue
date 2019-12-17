<template>
  <div class="speed-btn-panel">
    <v-speed-dial
      v-model="fab"
      :top="top"
      :bottom="bottom"
      :right="right"
      :left="left"
      :direction="direction"
      :open-on-hover="hover"
      :transition="transition"
    >
      <template v-slot:activator>
        <v-btn
          v-model="fab"
          color="blue darken-2"
          dark
          fab
        >
          <v-icon v-if="fab">
            mdi-close
          </v-icon>
          <v-icon v-else>
            mdi-map-marker
          </v-icon>
        </v-btn>
      </template>
      <v-btn
        fab
        dark
        small
        color="green"
        @click.stop.prevent="onEditPoiClick"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        fab
        dark
        small
        color="indigo"
        @click.stop.prevent="onAddPoiClick"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn
        fab
        dark
        small
        color="red"
        @click.stop.prevent="onDeletePoiClick"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-speed-dial>
  </div>
</template>

<script>
export default {
  name: 'ActionButtons',
  data: function () {
    return {
      direction: 'top',
      fab: false,
      fling: false,
      hover: false,
      tabs: null,
      top: false,
      right: true,
      bottom: true,
      left: false,
      transition: 'slide-y-reverse-transition'
    };
  },
  methods: {
    onAddPoiClick () {
      this.$root.$emit('addPoiClick');
    },
    onEditPoiClick () {
      this.$root.$emit('editPoiClick');
    },
    onDeletePoiClick () {
      this.$root.$emit('deletePoiClick');
    }
  }
}
</script>

<style scoped>
  .speed-btn-panel {
    position: absolute;
    right: 45px !important;
    bottom: 70px !important;
  }
</style>
