<template>
  <v-card
    id="floorList"
    class="mx-auto floor-changer"
    max-height="400px"
    dark
  >
    <v-list dense>
      <v-list-item-group mandatory>
        <v-list-item
          v-for="(floor, i) in floors"
          :key="i"
          @click.stop="onFloorClick(floor, true)"
        >
          <v-list-item-content>
            <v-list-item-title v-text="floor.short_name" />
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

<script>
import api from '../util/api';
import config from '../util/indrzConfig';

const { env } = config;

export default {
  props: {
    floors: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  data () {
    return {
      setSelection: null
    };
  },

  watch: {
    floors () {
      if (this.setSelection) {
        this.selectFloorWithCss(this.setSelection);
      }
    }
  },

  methods: {
    fetchFloors () {
      return api.request({
        endPoint: 'floor/'
      }, {
        baseApiUrl: process.env.BASE_API_URL,
        token: process.env.TOKEN
      });
    },
    onFloorClick (floor, isEvent) {
      const floorName = env.LAYER_NAME_PREFIX + floor.short_name.toLowerCase();
      this.$emit('floorClick', floorName);
      this.selectFloorWithCss(floor.floor_num, isEvent);
    },
    selectFloorWithCss (floorNum, isEvent) {
      setTimeout(() => {
        const activeClass = 'v-list-item--active';
        const linkClass = 'v-list-item--link';
        const listItems = this.$el.querySelectorAll('.v-list-item');
        const floorNumToFind = floorNum.toString().includes('.') ? Number(floorNum) : Number(floorNum).toFixed(1);
        const floorIndex = this.floors.findIndex(floor => floor.floor_num.toFixed(1) === floorNumToFind);

        listItems.forEach((item) => {
          item.classList.remove(activeClass, linkClass);
        });
        if (listItems.length && floorIndex > -1) {
          listItems[floorIndex].classList.add(activeClass, linkClass);
          if (!isEvent) {
            const list = document.getElementById('floorList');
            list.scrollTo({ top: (40 * floorIndex), behavior: 'smooth' });
          }
        }
      }, 500);
    },
    getFloorByFloorName (floorName) {
      const shortName = env.LAYER_NAME_PREFIX ? floorName.split(env.LAYER_NAME_PREFIX)[1] : floorName;
      if (!shortName) {
        return {};
      }
      const foundFloors = this.floors.filter(floor => floor.short_name.toLowerCase() === shortName);
      if (foundFloors && foundFloors.length) {
        return foundFloors[0];
      }
      return {};
    }
  }
};
</script>

<style scoped>
  .floor-changer {
    position: absolute;
    right: 10px;
    top: 70px;
    overflow-y: auto;
    background-color: #1337bf;
  }
  .v-list-item--active{
    background-color: #0048ff;
  }
</style>
