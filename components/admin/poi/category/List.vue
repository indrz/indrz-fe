<template>
  <v-container>
    <v-row>
      <v-col>
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
          v-model="selection"
          :items="poiData"
          selected-color="indigo"
          selectable
          return-object
          item-key="id"
          class="poi"
          dense
          style="overflow: auto; width: auto;"
        />
      </v-col>
      <v-divider vertical></v-divider>
      <v-col
        class="pa-6"
        cols="6"
      >
        <template v-if="!selection.length">
          No category selected.
        </template>
        <template v-else>
          <div
            v-for="node in selection"
            :key="node.id"
          >
            {{ node.name }}
          </div>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';

export default {
  name: 'PoiCategoryList',
  props: {
  },
  data () {
    return {
      selection: [],
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

  mounted () {
    this.loadDataToPoiTree();
  },

  methods: {
    ...mapActions({
      loadPOI: 'poi/LOAD_POI'
    }),
    async loadDataToPoiTree () {
      await this.loadPOI();
      this.loading = false;
    }
  }
};
</script>
