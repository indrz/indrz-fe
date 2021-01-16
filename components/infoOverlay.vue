<template>
  <div id="indrz-popup" title="indrz info" class="ol-popup indrz-popup">
    <a id="popup-closer" href="#" class="ol-popup-closer" @click.stop="onPopupCloseClick" />
    <div id="popup-content" />
    <div id="popup-links">
      <v-btn text color="primary" small @click.stop="onRouteClick('from')">
        <v-icon left>
          mdi-map-marker
        </v-icon> Route from here
      </v-btn>
      <v-btn text color="primary" small @click.stop="onRouteClick('to')">
        <v-icon left>
          mdi-map-marker
        </v-icon> Route to here
      </v-btn>
      <br>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" icon @click.stop="onShareButtonClick" v-on="on">
            <v-icon>mdi-share-variant</v-icon>
          </v-btn>
        </template>
        <span>Share</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoOverlay',
  methods: {
    onPopupCloseClick () {
      this.$emit('closeClick');
    },
    onShareButtonClick () {
      this.$emit('shareClick');
    },
    onRouteClick (path) {
      this.$emit('popupRouteClick', path);
    }
  }
};
</script>

<style scoped>
</style>
