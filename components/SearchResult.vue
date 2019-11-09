<template>
  <div id="search-result-list" class="list-group">
    <div v-if="!searchResult.length">
      <span>No results available</span>
    </div>
    <template v-for="(result, i) in searchResult">
      <span :key="i" v-html="result"></span>
    </template>
  </div>
</template>

<script>
export default {
  name: 'SearchResult',
  props: {
    searchResult: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  data () {
    return {
    }
  },
  methods: {
  }
};
</script>
