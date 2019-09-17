<template>
  <div>
    <div class="text-center">
      <v-progress-circular
        v-if="loading"
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>

    <v-list v-if="!loading" dense nav>
      <v-list-item-group color="primary">
        <v-list-item
                v-for="(location, i) in locations"
                :key="i"
                @click.stop="onLocationClick(location)"
        >
          <v-list-item-content>
            <v-list-item-title v-text="location.campus_name" />
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script>
import api from '../util/api';

export default {
  name: 'CampusLocations',
  data: () => ({
    loading: true,
    locations: []
  }),

  async mounted () {
    const locationsData = await this.fetchLocations();
    if (locationsData && locationsData.data) {
      this.locations = locationsData.data;
    }
    this.loading = false;
  },

  methods: {
    onLocationClick (location) {
      this.$emit('locationClick', location.centroid);
    },
    fetchLocations () {
      return api.request({
        endPoint: 'campus'
      });
    }
  }
};
</script>
