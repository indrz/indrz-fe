<template>
  <div>
    <div id="indrz-geolocation" class="ol-control ol-unselectable geolocation">
      <button class="default" title="Locate me" />
    </div>
  </div>
</template>

<script>
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
// import { circular } from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import Control from 'ol/control/Control';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

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
    return {
      source: null,
      layer: null,
      watchId: null
    };
  },
  computed: {
    locationButton () {
      const container = document.getElementById('indrz-geolocation');
      const button = container.getElementsByTagName('button');
      const classList = button[0].classList;
      return {
        container,
        button,
        classList
      }
    }
  },
  watch: {
    map: function (newValue) {
      this.addControl();
    }
  },
  methods: {
    addControl () {
      this.source = new VectorSource();
      this.layer = new VectorLayer({
        source: this.source
      });

      this.map.addLayer(this.layer);
      this.locationButton.container.addEventListener('click', () => {
        const isActiveButton = this.locationButton.classList.contains('active');

        this.clearWatch();
        if (!isActiveButton) {
          this.addToWatch();
        }
      });

      this.map.addControl(new Control({
        element: this.locationButton.container
      }));
    },

    clearWatch () {
      this.source.clear(true);
      this.locationButton.classList.remove('active');

      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
      }
    },

    addToWatch () {
      this.watchId = navigator.geolocation.watchPosition((pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        // const accuracy = circular(coords, pos.coords.accuracy);

        this.source.addFeatures([
          // new Feature(accuracy.transform('EPSG:4326', this.map.getView().getProjection())),
          // new Feature(new Point(fromLonLat(coords)))
          this.getPositionFeature(fromLonLat(coords))
        ]);
        this.map.getView().fit(this.source.getExtent(), {
          maxZoom: 18,
          duration: 500
        });
        this.locationButton.classList.add('active');
      }, function (error) {
        alert(`ERROR: ${error.message}`);
        this.locationButton.classList.remove('active');
      }, {
        enableHighAccuracy: true
      });
    },

    getPositionFeature (coordinates) {
      const positionFeature = new Feature();
      positionFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: '#3399CC'
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 2
            })
          })
        })
      );
      positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
      return positionFeature;
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
