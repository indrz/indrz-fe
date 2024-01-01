<template>
  <BaseMap />
</template>

<script>
import BaseMap from '~/components/BaseMap.vue';

export default {
  name: 'ZoneplanMap',
  components: {
    BaseMap
  },
  data () {
    return {
      map: null,
      center: [1822279.3104, 6139940.224], // Adjust center as needed
      zoom: 18
    };
  },
  mounted () {},
  methods: {}
};
</script>

<style>
#map {
  width: 100%;
  height: 500px;
}
#info {
  z-index: 1;
  opacity: 0;
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 0;
  background: rgba(0, 60, 136, 0.7);
  color: white;
  border: 0;
  transition: opacity 100ms ease-in;
}
</style>
