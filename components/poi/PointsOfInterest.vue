<template>
  <div>
    <div class="text-center">
      <v-progress-circular
        v-if="loading"
        indeterminate
        color="primary"
      />
    </div>
    <v-treeview
      v-if="!loading"
      v-model="tree"
      :items="poiData"
      selected-color="indigo"
      open-on-click
      selectable
      return-object
      expand-icon="mdi-chevron-down"
      on-icon="mdi-bookmark"
      off-icon="mdi-bookmark-outline"
      indeterminate-icon="mdi-bookmark-minus"
      item-key="id"
      dense
      class="poi"
      ref="poi"
    >
      <template v-slot:prepend="{ item, open }">
        <v-icon v-if="!item.icon">
          {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
        </v-icon>
        <v-icon v-else>
          mdi-{{ item.icon }}
        </v-icon>
      </template>
    </v-treeview>
<!--
    <v-chip
      v-for="(selection, i) in tree"
      :key="i"
      color="grey"
      dark
      small
      class="ma-1"
    >
      <v-icon left small>mdi-beer</v-icon>
      {{ selection.name }}
    </v-chip>
    -->
  </div>
</template>

<script>
import _ from 'lodash';
import api from '../../util/api';

export default {
  name: 'PointsOfInterest',
  data () {
    return {
      files: {
        html: 'mdi-language-html5',
        js: 'mdi-nodejs',
        json: 'mdi-json',
        md: 'mdi-markdown',
        pdf: 'mdi-file-pdf',
        png: 'mdi-file-image',
        txt: 'mdi-file-document-outline',
        xls: 'mdi-file-excel'
      },
      tree: [],
      poiData: [],
      loading: true
    }
  },
  async mounted () {
    const poiData = await this.fetchPoiTreeData();
    if (poiData && poiData.data) {
      this.poiData = poiData.data;
    }
    this.loading = false;
  },

  watch: {
    tree (newSelections, oldSelections) {
      let removedItems = [];
      let newItems = [];
      let oldItems = [];

      if (oldSelections.length > newSelections.length) {
        removedItems = _.differenceBy(oldSelections, newSelections, 'id');
      }
      if (newSelections.length > oldSelections.length) {
        newItems = _.differenceBy(newSelections, oldSelections, 'id');
      }
      oldItems = _.intersectionBy(newSelections, oldSelections, 'id');

      this.$emit('poiLoad', {
        newItems,
        oldItems,
        removedItems
      })
    }
  },

  methods: {
    onLocationClick (location) {
      this.$emit('locationClick', location.centroid);
    },
    fetchPoiTreeData () {
      return api.request({
        endPoint: 'poi/tree/'
      });
    }
  }
}
</script>

<style scoped>
.poi {
  font-size: 0.875rem;
}
</style>
