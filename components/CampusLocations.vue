<template>
  <expansion-container :title="getTitle">
    <v-list shaped dense>
      <v-list-item-group v-model="item" color="primary">
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
        >
          <v-list-item-content>
            <v-list-item-title v-text="item.text" />
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </expansion-container>
</template>

<script>
import ExpansionContainer from './base/ExpansionContainer';

export default {
  name: 'CampusLocations',
  components: {
    ExpansionContainer
  },
  data: () => ({
    item: 1,
    items: [
      { text: 'Real-Time', icon: 'mdi-clock' },
      { text: 'Audience', icon: 'mdi-account' },
      { text: 'Conversions', icon: 'mdi-flag' }
    ]
  }),
  computed: {
    getTitle () {
      return this.$t('title.campus_locations');
    }
  }
};
</script>
