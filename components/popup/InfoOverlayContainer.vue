<template>
  <div>
    <info-overlay @closeClick="onPopupCloseClick" @shareClick="onShareButtonClick" @popupRouteClick="onPopupRouteClick">
      <template #popup-links="{ overlay }">
        <div id="popup-links">
          <v-btn @click.stop="overlay.onRouteClick('from')" text color="primary" small>
            <v-icon left>
              mdi-map-marker
            </v-icon> Route from here
          </v-btn>
          <v-btn @click.stop="overlay.onRouteClick('to')" text color="primary" small>
            <v-icon left>
              mdi-map-marker
            </v-icon> Route to here
          </v-btn>
          <br>
        </div>
      </template>
      <template #action-buttons>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <slot />
            <v-btn @click.stop="onShareButtonClick" v-on="on" color="primary" icon>
              <v-icon>mdi-share-variant</v-icon>
            </v-btn>
          </template>
          <span>Share</span>
        </v-tooltip>
      </template>
    </info-overlay>
  </div>
</template>

<script>
import InfoOverlay from './infoOverlay';

export default {
  name: 'InfoOverlayContainer',
  components: { InfoOverlay },
  methods: {
    onPopupCloseClick () {
      this.$emit('closeClick');
    },
    onShareButtonClick () {
      this.$emit('shareClick');
    },
    onPopupRouteClick (path) {
      this.$emit('popupRouteClick', path);
    }
  }
}
</script>

<style scoped>

</style>
