<template>
  <v-list dense>
    <v-list-item-group v-model="item" color="primary">
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        @click.stop="onLocationClick(item)"
      >
        <v-list-item-content>
          <v-list-item-title v-text="item.name" />
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
  </v-list>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CampusLocations',
  data: () => ({
    item: 1,
    items: [
      { name: 'AAU Campus', value: 1 },
      { name: 'Robert Musil InstitutBahnhofstraße', value: 2 },
      { name: 'IFF-Klagenfurt Sterneckstraße', value: 3 }
    ],
    locations: []
  }),

  async mounted () {
    this.locations = await this.fetchLocations();
    console.log(this.locations);
  },

  methods: {
    onLocationClick (item) {
      this.$emit('locationClick', item.value);
    },
    async fetchLocations () {
      try {
        return await axios({
          url: 'https://campusplan.aau.at/en/indrz/api/v1/campus/',
          method: 'GET',
          headers: {
            'Authorization': 'Token 3d673589ecc8128d7a16286c5f20bdbb5f768381',
            'Content-Type': 'application/json'
          }
        })
      } catch (err) {
        console.log(err);
        return [];
      }
    }
  }
};
</script>
