<template>
  <div>
    <div id="indrz-geolocation" class="ol-control ol-unselectable geolocation">
      <button class="default" title="Locate me"></button>
    </div>
  </div>
</template>

<script>
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { circular } from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import Control from 'ol/control/Control';
import { fromLonLat } from 'ol/proj';

export default {
  name: 'UserGeoLocation',
  props: {
    map: {
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  data () {
    return {};
  },
  watch: {
    map: function (newValue) {
      this.addControl();
    }
  },
  methods: {
    addControl () {
      const source = new VectorSource();
      const layer = new VectorLayer({
        source: source
      });
      const locationButtonContainer = document.getElementById('indrz-geolocation');
      const locationButton = locationButtonContainer.getElementsByTagName('button');

      this.map.addLayer(layer);

      navigator.geolocation.watchPosition((pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        const accuracy = circular(coords, pos.coords.accuracy);

        source.clear(true);
        source.addFeatures([
          new Feature(accuracy.transform('EPSG:4326', this.map.getView().getProjection())),
          new Feature(new Point(fromLonLat(coords)))
        ]);
        locationButton[0].classList.add('active');
      }, function (error) {
        alert(`ERROR: ${error.message}`);
        locationButton[0].classList.remove('active');
      }, {
        enableHighAccuracy: true
      });

      locationButtonContainer.addEventListener('click', () => {
        if (!source.isEmpty()) {
          this.map.getView().fit(source.getExtent(), {
            maxZoom: 18,
            duration: 500
          });
        }
      });

      this.map.addControl(new Control({
        element: locationButtonContainer
      }));
    }
  }
}
</script>

<style lang="scss" scoped>
  .locate {
    top: 6em;
    left: .5em;
  }

  .geolocation {
    right: 10px !important;
    bottom: 95px !important;
    button {
      background-image: url('~@/static/images/icons/mylocation-sprite-1x.png');
      background-repeat: no-repeat;
      background-color: rgba(255,255,255,0.5);
    }
    .default {
      background-position: 3px 3px;
    }
    .active {
      background-position: -159px 3px;
    }
  }

</style>
