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
      ref="poi"
      v-if="!loading"
      v-model="tree"
      :multiple-active="multi"
      :items="poiData"
      selected-color="indigo"
      selectable
      return-object
      item-key="id"
      class="poi"
      dense
      style="overflow: auto; width: auto;"
    >
      <template slot="label" slot-scope="{ item }">
        <span @click="onTreeClick(item)" style="white-space: normal">
          {{ item['name_' + $i18n.locale] }}
        </span>
      </template>
      <template v-slot:prepend="{ item, active }">
        <div @click="onTreeClick(item)">
          <img v-if="active" :src="item.icon" style="height:25px;">
          <!-- <img v-if="active" src="/media/poi_icons/other_pin.png" style="height:25px;"> -->
          <img v-else src="/media/poi_icons/other_pin_grey.png" style="height:25px;">
        </div>
      </template>
    </v-treeview>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapActions, mapState, mapGetters } from 'vuex';

export default {
  name: 'PointsOfInterest',
  props: {
    initialPoiCatId: {
      type: Number,
      default: function () {
        return null;
      }
    },
    initialPoiId: {
      type: String,
      default: function () {
        return null;
      }
    },
    multi: {
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
      openedItems: [],
      forceReloadNode: false,
      loading: true,
      currentPoi: null
    };
  },

  computed: {
    ...mapState({
      poiData: state => state.poi.poiData
    }),
    ...mapGetters({
      findNode: 'poi/findNode'
    }),
    treeComp () {
      return this.$refs.poi;
    }
  },

  watch: {
    tree (newSelections, oldSelections) {
      let removedItems = [];
      let newItems = [];
      let oldItems = [];

      if (this.multi === false) {
        removedItems = oldSelections;
        newItems = this.currentPoi;
      } else {
        if (oldSelections.length > newSelections.length) {
          removedItems = _.differenceBy(oldSelections, newSelections, 'id');
        }
        if (newSelections.length > oldSelections.length) {
          newItems = _.differenceBy(newSelections, oldSelections, 'id');
        }
        oldItems = _.intersectionBy(newSelections, oldSelections, 'id');
      }

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
      });
    }
  },

  mounted () {
    this.loadDataToPoiTree();
  },

  methods: {
    ...mapActions({
      loadPOI: 'poi/LOAD_POI'
    }),
    async loadDataToPoiTree () {
      await this.loadPOI();
      if (this.initialPoiCatId) {
        setTimeout(() => {
          this.loadInitialPOICategory();
        }, 1000)
      } else if (this.initialPoiId) {
        setTimeout(() => {
          this.$emit('loadSinglePoi', this.initialPoiId);
        }, 500);
      }
      this.loading = false;
    },
    loadInitialPOICategory () {
      const foundData = this.findNode(Number(this.initialPoiCatId));

      if (!foundData) {
        this.loading = false;
        return;
      }
      this.tree = [foundData.data];
      const treeComp = this.treeComp;

      if (foundData && foundData.roots) {
        foundData.roots.reverse().forEach((node) => {
          treeComp.updateOpen(node, true);
        });
      }

      treeComp.updateOpen(this.initialPoiCatId, true);

      if (foundData?.data?.children) {
        foundData.data.children.forEach((child) => {
          treeComp.updateActive(child.id, true);
          treeComp.updateSelected(child.id, true);
        });
      }

      treeComp.updateActive(this.initialPoiCatId, true);
      treeComp.updateSelected(this.initialPoiCatId, true);
      this.onTreeClick(foundData)
    },
    onTreeClick (node) {
      const treeComp = this.$refs.poi;
      const handler = node.children ? this.onTreeParentNodeClick : this.onLeafNodeClick;

      handler(node, treeComp);
    },
    onLeafNodeClick (node, treeComp, forceSelect) {
      const shouldAdd = (forceSelect === undefined ? !treeComp.selectedCache.has(node.id) : forceSelect);

      treeComp.updateSelected(node.id, (this.multi === false ? true : shouldAdd));
      treeComp.updateActive(node.id, (this.multi === false ? true : shouldAdd));

      this.currentPoi = node.children || [node];

      this.$emit('selectPoiCategory', node);
      treeComp.emitSelected();
    },
    onTreeParentNodeClick (node, treeComp) {
      if (!treeComp.nodes[node.id].parent) {
        this.expandCollapseNode(node.id, treeComp);
        return;
      }

      if (!treeComp.nodes[node.id].isOpen) {
        this.expandCollapseNode(node.id, treeComp);
      }
      const shouldAdd = !treeComp.activeCache.has(node.id);

      node.children.forEach(childNode => this.onLeafNodeClick(childNode, treeComp, shouldAdd));

      treeComp.updateActive(node.id, (this.multi === false ? true : shouldAdd));

      treeComp.emitActive();
    },
    expandCollapseNode (nodeId, treeComp) {
      const isOpened = treeComp.nodes[nodeId].isOpen;
      treeComp.updateOpen(nodeId, !isOpened);
      treeComp.emitOpen();
    },
    onLocationClick (location) {
      this.$emit('locationClick', location.centroid);
    }
  }
};
</script>

<style>
.poi {
  font-size: 0.875rem;
}
.v-treeview-node__checkbox {
  display: none !important;
}
</style>
