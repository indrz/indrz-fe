<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-toolbar flat dens>
            <v-spacer />
            <v-btn icon small color="indigo">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-btn icon small color="green" :disabled="!isActiveCategory">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small color="red" :disabled="!isActiveCategory">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
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
              :active.sync="currentCategory"
              :multiple-active="false"
              :items="poiData"
              open-on-click
              transition
              activatable
              hoverable
              return-object
              item-key="id"
              class="poi no-checkbox"
              dense
              style="overflow: auto; width: auto;"
            >
              <template slot="label" slot-scope="{ item }">
        <span style="white-space: normal">
          {{ item['name_' + $i18n.locale] }}
        </span>
              </template>
              <template v-slot:prepend="{ item }">
                <div>
                  <img v-if="item.icon" :src="item.icon" style="height:25px;">
                  <img v-else src="/media/poi_icons/other_pin_grey.png" style="height:25px;">
                </div>
              </template>
            </v-treeview>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import PointsOfInterest from '@/components/poi/PointsOfInterest';

export default {
  name: 'PoiCategoryList',
  components: {
    PointsOfInterest
  },
  data () {
    return {
      currentCategory: [],
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
    },
    isActiveCategory () {
      return this.currentCategory.length;
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
