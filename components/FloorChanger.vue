<template>
  <v-card
    class="mx-auto floor-changer"
    max-height="200px"
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
export default {
  data () {
    return {
      loading: true,
      floors: []
    }
  },

  async mounted () {
    const floorData = await this.fetchFloors();

    if (floorData && floorData.data && floorData.data.results) {
      this.floors = floorData.data.results;
      this.floors.sort((a, b) => (Number(a.floor_num) > Number(b.floor_num)) ? 1 : -1);
    }
    this.loading = false;
  },

  methods: {
    fetchFloors () {
      return api.request({
        endPoint: 'floor'
      });
    },
    onFloorClick (floor) {
      this.$emit('floorClick', floor);
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
