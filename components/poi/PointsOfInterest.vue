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
      ref="poi"
      v-model="tree"
      :multiple-active="multi"
      :items="poiData"
      selected-color="indigo"
      open-on-click
      selectable
      return-object
      item-key="id"
      class="poi"
      dense
    >
      <template slot="label" slot-scope="{ item }">
        <div style="width: 100%; height: 100%" @click="onTreeClick(item)">
          {{ item.name }}
        </div>
      </template>
      <template v-slot:prepend="{ item, open, active }">
        <img v-if="active" :src="item.icon" @click="onTreeClick(item)">
        <img v-else :src="item.icon" @click="onTreeClick(item)">
        <v-icon v-if="!item.icon">
          {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
        </v-icon>
        <v-icon v-else>
          mdi-{{ item.icon }}
        </v-icon>
      </template>
    </v-treeview>
  </div>
</template>

<script>
import _ from 'lodash';
import api from '../../util/api';

export default {
  name: 'PointsOfInterest',
  props: {
    'initialPoiCatId': {
      type: String,
      default: function () {
        return null;
      }
    },
    'initialPoiId': {
      type: String,
      default: function () {
        return null;
      }
    },
    'multi': {
      type: Boolean,
      default: function () {
        return true;
      }
    }
  },
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
      openedItems: [],
      forceReloadNode: false,
      loading: true
    }
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

      if (
        this.forceReloadNode &&
        newSelections.length === oldSelections.length &&
        newSelections[0].id === oldSelections[0].id) {
        newItems = newSelections;
        removedItems = newSelections;
        oldItems = [];
        this.forceReloadNode = false;
      }
      this.$root.$emit('poiLoad', {
        newItems,
        oldItems,
        removedItems
      })
    }
  },

  mounted () {
    this.loadDataToPoiTree();
  },

  methods: {
    async loadDataToPoiTree () {
      const poiData = await this.fetchPoiTreeData();
      if (poiData && poiData.data) {
        this.poiData = poiData.data;
        if (this.initialPoiCatId) {
          const foundData = this.findItem(Number(this.initialPoiCatId), this.poiData);
          this.tree = [foundData.data];
          setTimeout(() => {
            const treeComp = this.$refs.poi;
            treeComp.updateSelected(this.initialPoiCatId, true);
            foundData.roots.reverse().forEach((node) => {
              treeComp.updateOpen(node, true);
            });
            treeComp.updateActive(this.initialPoiCatId, true);
          }, 500);
        } else if (this.initialPoiId) {
          setTimeout(() => {
            this.$emit('loadSinglePoi', this.initialPoiId);
          }, 500);
        }
      }
      this.loading = false;
    },
    onTreeClick (item) {
      const treeComp = this.$refs.poi;
      const shouldAdd = !treeComp.selectedCache.has(item.id);

      treeComp.updateSelected(item.id, shouldAdd);
      treeComp.updateActive(item.id, shouldAdd);
      this.$emit('selectPoiCategory', item);
      treeComp.emitSelected();
    },
    onLocationClick (location) {
      this.$emit('locationClick', location.centroid);
    },
    fetchPoiTreeData () {
      return api.request({
        endPoint: 'poi/tree/'
      });
    },
    findItem (itemId, data) {
      let foundData = null;

      data.some((d) => {
        if (d.id && d.id === itemId) {
          foundData = d;
          return true;
        }
        if (d.children) {
          foundData = this.findItem(itemId, d.children);
          if (foundData) {
            if (!foundData.roots) {
              foundData = {
                data: foundData,
                roots: [d.id]
              };
            } else {
              foundData.roots.push(d.id);
            }
            return true;
          }
        }
      });
      return foundData;
    }
  }
}
</script>

<style>
.poi {
  font-size: 0.875rem;
}
.v-treeview-node__checkbox {
  display: none !important;
}
</style>
