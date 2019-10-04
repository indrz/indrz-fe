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
          @click.stop="onFloorClick(floor)"
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
import indrzConfig from '../util/indrzConfig';

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
    }
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
        endPoint: 'floor'
      });
    },
    onFloorClick (floor) {
      const floorName = indrzConfig.layerNamePrefix + floor.short_name.toLowerCase();
      this.$emit('floorClick', floorName);
      this.selectFloorWithCss(floor.short_name.toLowerCase());
    },
    selectFloorWithCss (floorName) {
      if (floorName.includes(indrzConfig.layerNamePrefix)) {
        floorName = floorName.split(indrzConfig.layerNamePrefix)[1];
      }
      setTimeout(() => {
        const activeClass = 'v-list-item--active';
        const linkClass = 'v-list-item--link';
        const listItems = this.$el.querySelectorAll('[role=listitem]');
        const floorIndex = this.floors.findIndex(_floor => _floor.short_name.toLowerCase() === floorName);
        listItems.forEach((item) => {
          item.classList.remove(activeClass, linkClass);
        });
        listItems[floorIndex].classList.add(activeClass, linkClass);
        listItems[floorIndex].scrollIntoView();
      }, 500);
    }
  }
}
</script>

<style scoped>
  .floor-changer {
    position: absolute;
    right: 10px;
    top: 70px;
    overflow-y: auto;
  }
</style>
