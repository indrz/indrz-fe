<template>
  <v-card
    class="mx-auto floor-changer"
    max-height="400px"
  >
    <v-list dense>
      <v-list-item-group mandatory color="primary">
        <v-list-item
          v-for="(floor, i) in floors"
          :key="i"
          @click.stop="onFloorClick(floor, true)"
        >
          <v-list-item-content style="min-width: 20px">
            <v-list-item-title v-text="floor.short_name" />
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

<script>
import api from '../util/api';

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
      const floorName = process.env.LAYER_NAME_PREFIX + floor.short_name.toLowerCase();
      this.$emit('floorClick', floorName);
      this.selectFloorWithCss(floor.short_name.toLowerCase(), isEvent);
    },
    selectFloorWithCss (floorName, isEvent) {
      if (process.env.LAYER_NAME_PREFIX && floorName.includes(process.env.LAYER_NAME_PREFIX)) {
        floorName = floorName.split(process.env.LAYER_NAME_PREFIX)[1];
      }
      setTimeout(() => {
        const activeClass = 'v-list-item--active';
        const linkClass = 'v-list-item--link';
        const listItems = this.$el.querySelectorAll('[role=listitem]');
        const floorIndex = this.floors.findIndex(_floor => _floor.short_name.toLowerCase() === floorName.toLowerCase());
        listItems.forEach((item) => {
          item.classList.remove(activeClass, linkClass);
        });
        if (listItems.length && floorIndex > -1) {
          listItems[floorIndex].classList.add(activeClass, linkClass);
          if (!isEvent) {
            listItems[floorIndex].scrollIntoView();
          }
        }
      }, 500);
    },
    getFloorByFloorName (floorName) {
      const shortName = process.env.LAYER_NAME_PREFIX ? floorName.split(process.env.LAYER_NAME_PREFIX)[1] : floorName;
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
  }
</style>
