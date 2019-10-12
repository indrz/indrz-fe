<template>
  <div>
    <template v-if="isRoute">
      <v-autocomplete
        v-model="model"
        :items="searchResult"
        :loading="isLoading"
        :search-input.sync="search"
        item-text="properties.name"
        item-value="properties.spaceid"
        :prepend-icon="icon"
        append-icon="mdi-magnify"
        :no-data-text="noResultText"
        single-line
        return-object
        flat
        hide-selected
        hide-details
        hide-no-data
        :label="routeLabel"
        @change="onSearchSelection"
      />
    </template>
    <template v-else>
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
  </div>
</template>

<script>
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import api from '../util/api';

export default {
  props: {
    isRoute: {
      type: Boolean,
      default: function () {
        return false;
      }
    },
    routeLabel: {
      type: String,
      default: function () {
        return '';
      }
    },
    routeType: {
      type: String,
      default: function () {
        return 'from';
      }
    },
    icon: {
      type: String,
      default: function () {
        return '';
      }
    }
  },
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
      this.term$.next(text);
    }
  },

  mounted () {
    this
      .term$
      .pipe(
        filter(term => term && term.length > 2),
        debounceTime(500),
        distinctUntilChanged()
      )
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
      this.$emit('selectSearhResult', {
        data: selection,
        routeType: this.routeType
      });
    },
    getValue () {
      return this.model;
    }
  }
}
</script>

<style scoped>
</style>
