<template>
  <v-autocomplete
    v-model="model"
    :items="searchResult"
    :loading="isLoading"
    :search-input.sync="search"
    item-text="properties.name"
    item-value="properties.spaceid"
    append-icon="mdi-magnify"
    :no-data-text="noResultText"
    single-line
    return-object
    solo
    flat
    hide-selected
    hide-details
    hide-no-data
    :label="searchLabel"
    @change="onSearchSelection"
  />
</template>

<script>
import { Subject } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import api from '../util/api';

export default {
  data () {
    return {
      searchLabel: this.$t('search_our_campus'),
      noResultText: 'No result found',
      serachItemLimit: 100,
      searchResult: [],
      isLoading: false,
      term$: new Subject(),
      model: null,
      search: null
    }
  },

  watch: {
    search (text) {
      if (text.length < 3) {
        return;
      }
      this.term$.next(text);
    }
  },

  mounted () {
    this
      .term$
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(term => this.apiSearch(term));
  },

  methods: {
    apiSearch (term) {
      this.isLoading = true;

      api.request({
        endPoint: 'search/' + term
      })
        .then((response) => {
          if (!response || !response.data) {
            return;
          }
          this.searchResult = response.data.features.filter(feature => feature.properties && feature.properties.name);
          if (this.searchResult.length > 100) {
            this.searchResult = this.searchResult.slice(0, this.serachItemLimit);
          }
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => (this.isLoading = false));
    },
    onSearchSelection (selection) {
      this.$emit('selectSearhResult', selection);
    }
  }
}
</script>

<style scoped>
</style>
