<template>
  <div id="indrz-popup" title="indrz info" class="ol-popup indrz-popup">
    <a id="popup-closer" @click.stop="onPopupCloseClick" href="#" class="ol-popup-closer" />
    <div id="popup-content" />
    <div id="popup-links">
      <v-btn @click.stop="onRouteClick('from')" text color="primary" small>
        <v-icon left>
          mdi-map-marker
        </v-icon> Route from here
      </v-btn>
      <v-btn @click.stop="onRouteClick('to')" text color="primary" small>
        <v-icon left>
          mdi-map-marker
        </v-icon> Route to here
      </v-btn>
      <br>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn @click.stop="onShareButtonClick" v-on="on" color="primary" icon>
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
}
</script>

<style scoped>
</style>
