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
        @click.stop.prevent="onEditPoiClick"
        color="green"
        fab
        dark
        small
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        @click.stop.prevent="onAddPoiClick"
        color="indigo"
        fab
        dark
        small
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn
        @click.stop.prevent="onDeletePoiClick"
        color="red"
        fab
        dark
        small
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
      this.$emit('action', 'addPoiClick');
    },
    onEditPoiClick () {
      this.$emit('action', 'editPoiClick');
    },
    onDeletePoiClick () {
      this.$emit('action', 'deletePoiClick');
    }
  }
};
</script>

<style scoped>
  .speed-btn-panel {
    position: absolute;
    right: 45px !important;
    bottom: 100px !important;
  }
</style>
