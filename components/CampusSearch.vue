<template>
  <div>
    <template v-if="isRoute">
      <v-autocomplete
        ref="searchField"
        v-model="model"
        :items="searchResult"
        :loading="isLoading"
        :search-input.sync="search"
        :prepend-icon="icon"
        :no-filter="true"
        :label="routeLabel"
        @click:clear="onClearClick"
        @change="onSearchSelection"
        item-text="properties.name"
        item-value="properties.spaceid"
        append-icon="mdi-magnify"
        single-line
        return-object
        flat
        hide-selected
        hide-details
        clearable
      >
        <template v-slot:no-data>
          <div class="v-list-item">
            <div class="v-list-item__content">
              <div class="v-list-item__title" :style="{'text-align': (isLoading) ? 'center' : 'left'}">
                <template v-if="!search || search.length < 3">
                  {{ minSearchCharacterLengthMessage }}
                </template>
                <v-progress-circular
                  v-else-if="search && search.length && isLoading"
                  indeterminate
                  color="primary"
                />
                <template v-else-if="search && search.length && !isLoading && !searchResult.length">
                  {{ noResultText }}
                </template>
              </div>
            </div>
          </div>
        </template>
      </v-autocomplete>
    </template>
    <template v-else>
      <v-autocomplete
        ref="searchField"
        v-model="model"
        :items="searchResult"
        :loading="isLoading"
        :search-input.sync="search"
        :no-filter="true"
        :label="searchLabel"
        @click:clear="onClearClick"
        @change="onSearchSelection"
        item-text="properties.name"
        item-value="properties.spaceid"
        append-icon="mdi-magnify"
        single-line
        return-object
        solo
        flat
        hide-selected
        hide-details
        clearable
      >
        <template v-slot:no-data>
          <div class="v-list-item">
            <div class="v-list-item__content">
              <div class="v-list-item__title" :style="{'text-align': (isLoading) ? 'center' : 'left'}">
                <template v-if="!search || search.length < 3">
                  {{ minSearchCharacterLengthMessage }}
                </template>
                <v-progress-circular
                  v-else-if="search && search.length && isLoading"
                  indeterminate
                  color="primary"
                />
                <template v-else-if="search && search.length && !isLoading && !searchResult.length">
                  {{ noResultText }}
                </template>
              </div>
            </div>
          </div>
        </template>
      </v-autocomplete>
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
      minSearchCharacterLengthMessage: this.$t('min_search_character_length_message'),
      noResultText: 'No result found',
      serachItemLimit: 100,
      searchResult: [],
      isLoading: false,
      term$: new Subject(),
      model: null,
      search: null,
      stopSearch: false
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
        filter(term => term && term.length > 2 && !this.stopSearch),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(term => this.apiSearch(term));
    this.$root.$on('load-search-query', this.onLoadSearchQuery);
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
    onClearClick () {
      this.$refs.searchField.blur();
    },
    getValue () {
      return this.model;
    },
    clearSearch () {
      this.model = null;
    },
    onLoadSearchQuery (query) {
      this.$refs.searchField.focus();
      this.search = query;
    }
  }
}
</script>

<style scoped>
</style>
