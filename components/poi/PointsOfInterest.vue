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
      :open="open"
      :items="poiData"
      return-object
      activatable
      multiple-active
      selection-type="leaf"
      item-key="name"
      dense
      class="poi"
      @update:active="onActiveNodeChange"
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
  </div>

</template>

<script>
import api from '../../util/api';

export default {
  name: 'PointsOfInterest',
  data () {
    return {
      open: ['public'],
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
    const poiData = await this.fetchPoiData();
    if (poiData && poiData.data) {
      this.poiData = poiData.data;
    }
    this.loading = false;
  },

  methods: {
    onLocationClick (location) {
      this.$emit('locationClick', location.centroid);
    },
    fetchPoiData () {
      return api.request({
        endPoint: 'poi/tree'
      });
    },
    onActiveNodeChange (nodes) {
      console.log(nodes.length);
    }
  }
}
</script>

<style scoped>
.poi {
  font-size: 0.875rem;
}
</style>
