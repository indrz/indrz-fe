<template>
  <div id="indrz-popup" title="indrz info" class="ol-popup indrz-popup">
    <a id="popup-closer" @click.stop="onPopupCloseClick" href="#" class="ol-popup-closer" />
    <div id="popup-content" />
    <slot name="popup-links" v-bind:overlay="{onRouteClick}" />
    <slot name="action-buttons" />
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
  .ol-popup {
    position: absolute;
    background-color: white;
    -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
    filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
    padding: 15px;
    border-radius: 0px;
    border: 1px solid #cccccc;
    bottom: 12px;
    left: -50px;
    min-width: 220px;
    z-index: 1;
  }

  .ol-popup:after, .ol-popup:before {
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }

  .ol-popup:after {
    border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
  }

  .ol-popup:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
  }

  .ol-popup-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
  }

  .ol-popup-closer:after {
    content: "X";
  }

  .indrz-popup p {
    font-family: Arial, sans-serif;
    font-size: 12px;
    letter-spacing: .1px;
    line-height: 12px;
    color: black;
    z-index: 0;
  }
</style>
