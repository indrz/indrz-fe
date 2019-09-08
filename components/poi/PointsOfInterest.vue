<template>
  <v-treeview
    v-model="tree"
    :open="open"
    :items="items"
    activatable
    item-key="name"
    open-on-click
    dense
    class="poi"
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
</template>

<script>
import data from './data.json';

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
      items: data
    }
  }
}
</script>

<style scoped>
.poi {
  font-size: 0.875rem;
}
</style>
