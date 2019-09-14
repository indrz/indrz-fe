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

export default {
  name: 'CampusLocations',
  data: () => ({
    item: 1,
    items: [
      { name: 'AAU Campus', value: 1 },
      { name: 'Robert Musil InstitutBahnhofstraße', value: 2 },
      { name: 'IFF-Klagenfurt Sterneckstraße', value: 3 }
    ]
  }),

  methods: {
    onLocationClick (item) {
      this.$emit('locationClick', item.value);
    }
  }
};
</script>
