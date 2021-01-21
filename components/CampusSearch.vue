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
        item-text="name"
        item-value="spaceid"
        append-icon=""
        single-line
        return-object
        flat
        hide-selected
        hide-details
      >
        <template v-slot:append>
          <v-icon class="search-btn">
            mdi-magnify
          </v-icon>
        </template>
        <template v-slot:append-outer>
          <v-icon :color="activeClearColor" @click.stop="onClearClick">
            mdi-close
          </v-icon>
        </template>
        <template v-slot:no-data>
          <div class="v-list-item">
            <div class="v-list-item__content">
              <div :style="{'text-align': (isLoading) ? 'center' : 'left'}" class="v-list-item__title">
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
        <template v-slot:item="{ item }">
          <v-list-item-content>
            <v-list-item-title v-text="item.name" />
            <v-list-item-subtitle v-text="`(${item.code}, Floor ${item.floorNum})`" />
          </v-list-item-content>
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
        item-text="name"
        item-value="spaceid"
        append-icon=""
        single-line
        return-object
        solo
        flat
        hide-selected
        hide-details
      >
        <template v-slot:append>
          <v-icon class="search-btn">
            mdi-magnify
          </v-icon>
        </template>
        <template v-slot:append-outer>
          <v-icon :color="activeClearColor" @click.stop="onClearClick">
            mdi-close
          </v-icon>
        </template>
        <template v-slot:no-data>
          <div class="v-list-item">
            <div class="v-list-item__content">
              <div :style="{'text-align': (isLoading) ? 'center' : 'left'}" class="v-list-item__title">
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
        <template v-slot:item="{ item }">
          <v-list-item-icon style="margin-right: 16px">
            <v-img
              :src="getIconUrl(item.src_icon)"
              max-height="24"
              max-width="24"
            />
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.name" />
            <v-list-item-subtitle v-text="`(${item.code}, Floor ${item.floorNum})`" />
          </v-list-item-content>
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
      apiResponse: [],
      isLoading: false,
      term$: new Subject(),
      model: null,
      search: null,
      stopSearch: false,
      iconNames: ['book', 'department', 'person', 'poi', 'space'],
      iconPath: '/images/icons/search/'
    }
  },
  computed: {
    activeClearColor () {
      return this.search && this.search.length ? 'blue darken-2' : 'grey';
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
        filter(term => (term && term.length > 2 && !this.stopSearch) || term === null),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((term) => {
        if (term !== null) {
          return this.apiSearch(term);
        }
      });
    this.$root.$on('load-search-query', this.onLoadSearchQuery);
  },

  methods: {
    apiSearch (term) {
      this.isLoading = true;

      api.request({
        endPoint: 'search/' + term
      }, {
        baseApiUrl: process.env.BASE_API_URL,
        token: process.env.TOKEN
      })
        .then((response) => {
          if (!response || !response.data) {
            return;
          }
          this.apiResponse = response.data.features.filter(feature => feature.properties && feature.properties.name);

          if (this.apiResponse.length > 100) {
            this.apiResponse = this.apiResponse.slice(0, this.serachItemLimit);
          }

          this.searchResult = this.apiResponse.map(({ properties }) => {
            let code = properties.roomcode;

            if (code.toLowerCase() === this.search.toLowerCase()) {
              code = properties.room_category || properties.external_id || code;
            }

            return {
              name: properties.name,
              floorNum: properties.floor_num,
              roomCode: properties.roomcode,
              src_icon: properties.src_icon,
              code
            }
          });
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.isLoading = false));
    },
    onSearchSelection (selection) {
      let data = null;

      if (selection) {
        data = this.apiResponse.find(responseData => responseData.properties.roomcode === selection.roomCode);
      }

      this.$emit('selectSearhResult', {
        data: data,
        routeType: this.routeType
      });
    },
    onClearClick () {
      this.$nextTick(() => {
        this.search = '';
        this.searchResult = [];
        this.$refs.searchField.blur();
        this.$emit('clearClicked');
      });
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
    },
    getIconUrl (iconName) {
      if (this.iconNames.includes(iconName)) {
        return `${this.iconPath}/${iconName}.png`;
      }
      return `${this.iconPath}/poi.png`;
    }
  }
};
</script>

<style scoped>
  .search-btn {
    border-right: 1px solid #d3d3d3;
    padding-right: 5px
  }
  ::v-deep .v-input__slot {
    padding-right: 0px !important;
  }
</style>
