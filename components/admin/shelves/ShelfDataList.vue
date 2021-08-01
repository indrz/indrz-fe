<template>
  <div>
    <v-card>
      <v-card-title>
        Shelf Data
        <v-spacer />
      </v-card-title>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="shelfListData"
        :server-items-length="total"
        :single-select="singleSelect"
        :options.sync="pagination"
        :loading="loading"
        :height="height"
        :no-data-text="noDataText"
        item-key="id"
        dense
        show-select
        class="elevation-1"
        loading-text="Loading... Please wait"
      >
        <template v-slot:top>
          <add-edit-shelf
            :title="formTitle"
            :dialog="dialog"
            :edited-item="editedItem"
            @save="save"
            @close="close"
          />
        </template>
        <template v-slot:item.map="{}">
          <v-icon
            small
          >
            mdi-map
          </v-icon>
        </template>
        <template v-slot:item.edit="{ item }">
          <v-icon
            @click="editItem(item)"
            small
          >
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import api from '@/util/api';
import AddEditShelf from './AddEditShelf';

export default {
  name: 'ShelfDataList',
  components: { AddEditShelf },
  props: {
    height: {
      type: Number,
      default: 285
    }
  },
  data () {
    return {
      loading: false,
      singleSelect: false,
      dialog: false,
      selected: [],
      pagination: {},
      headers: [
        {
          text: 'External Id',
          align: 'right',
          sortable: false,
          value: 'external_id'
        },
        {
          text: 'Floor',
          align: 'right',
          filterable: false,
          sortable: false,
          value: 'building_floor'
        },
        {
          text: 'System From',
          align: 'right',
          sortable: true,
          value: 'system_from'
        },
        {
          text: 'System To',
          align: 'right',
          sortable: true,
          value: 'system_to'
        },
        {
          text: 'Shelf Side',
          align: 'right',
          filterable: false,
          sortable: false,
          value: 'side'
        },
        {
          text: 'Measure From',
          align: 'right',
          filterable: false,
          sortable: false,
          value: 'measure_from'
        },
        {
          text: 'Measure To',
          align: 'right',
          filterable: false,
          sortable: false,
          value: 'measure_to'
        },
        { text: 'Edit', value: 'edit', sortable: false, filterable: false, width: '56px' }
      ],
      editedIndex: -1,
      editedItem: {},
      defaultItem: {
        bookshelf_id: null,
        external_id: null,
        floor: null,
        id: null,
        measure_from: null,
        measure_to: null,
        section_child: null,
        section_id: null,
        section_main: null,
        side: 'L',
        system_from: null,
        system_to: null
      }
    };
  },
  computed: {
    ...mapState({
      shelfListData: function (state) {
        const { data, total } = state.shelf.shelfData;

        this.total = total;

        return data;
      },
      noDataText: (state) => {
        if (state.shelf.selectedShelf) {
          return 'No shelf data found';
        }
        return 'No book shelf selected';
      }
    }),
    formTitle () {
      return this.editedIndex === -1 ? 'New Shelf' : 'Edit Shelf';
    }
  },
  watch: {
    dialog (val) {
      val || this.close();
    },
    pagination: {
      handler () {
        this.loadData();
      },
      deep: true
    }
  },
  mounted () {
    this.loadData();
  },
  methods: {
    ...mapActions({
      loadShelfList: 'shelf/LOAD_BOOKSHELF_LIST'
    }),
    async loadData (term) {
      if (this.loading) {
        return;
      }

      this.loading = true;
      const query = api.getPageParams(this.pagination);

      if (term) {
        query.search = term;
      }

      await this.loadShelfList(query);

      this.loading = false;
    },

    editItem (item) {
      this.editedIndex = this.shelfListData.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    close () {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    save () {
      if (this.editedIndex > -1) {
        Object.assign(this.shelfListData[this.editedIndex], this.editedItem);
      }
      // We are not adding shelf yet. So commenting out the following line
      /*
      else {
        this.shelfListData.push(this.editedItem);
      }
      */
      this.close();
    }
  }
};
</script>

<style scoped>

</style>=
