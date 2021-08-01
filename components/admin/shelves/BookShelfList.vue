<template>
  <v-card>
    <v-card-title>
      Book Shelves
      <v-spacer />
      <v-text-field
        v-model="search"
        label="Search"
        clearable
        single-line
        hide-details
      />
    </v-card-title>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="shelvesListData"
      :server-items-length="total"
      :single-select="singleSelect"
      :options.sync="pagination"
      :loading="loading"
      :height="height"
      dense
      item-key="id"
      class="elevation-1"
      loading-text="Loading... Please wait"
      @click:row="onShelfClick"
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
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import api from '../../../util/api';
import AddEditShelf from './AddEditShelf';

export default {
  name: 'BookShelfList',
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
      search: '',
      term$: new Subject(),
      headers: [
        {
          text: 'Id',
          align: 'right',
          sortable: false,
          value: 'id'
        },
        {
          text: 'External Id',
          align: 'right',
          sortable: false,
          value: 'external_id'
        },
        {
          text: 'Building',
          align: 'right',
          filterable: false,
          sortable: false,
          value: 'building'
        },
        {
          text: 'Floor',
          align: 'right',
          filterable: false,
          sortable: false,
          value: 'building_floor'
        },
        {
          text: 'Length',
          align: 'right',
          filterable: false,
          sortable: false,
          value: 'length'
        },
        {
          text: 'Width',
          align: 'right',
          filterable: false,
          sortable: false,
          value: 'width'
        },
        {
          text: 'Left From Label',
          align: 'left',
          sortable: true,
          value: 'left_from_label'
        },
        {
          text: 'Left To Label',
          align: 'left',
          sortable: true,
          value: 'left_to_label'
        },
        {
          text: 'Right From Label',
          align: 'left',
          sortable: true,
          value: 'right_from_label'
        },
        {
          text: 'Right To Label',
          align: 'left',
          sortable: true,
          value: 'right_to_label'
        },
        { text: 'Map', value: 'map', sortable: false, filterable: false, width: '56px' },
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
      shelvesListData: function (state) {
        const { data, total } = state.shelf.shelves;
        const tableData = [];

        this.total = total;

        data.forEach((d) => {
          tableData.push({ ...d.properties, id: d.id, geometry: d.geometry });
        });
        return tableData;
      }
    }),
    formTitle () {
      return this.editedIndex === -1 ? 'New Shelf' : 'Edit Shelf';
    }
  },
  watch: {
    search (text) {
      this.term$.next(text);
    },
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
    this
      .term$
      .pipe(
        filter(term => !term || term.length > 2),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(term => this.loadData(term));
    this.loadData();
  },
  methods: {
    ...mapActions({
      loadShelfList: 'shelf/LOAD_BOOKSHELF_LIST',
      setSelectedShelf: 'shelf/SET_SELECTED_SHELF'
    }),
    onShelfClick (shelf) {
      this.setSelectedShelf(shelf);
    },
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
      this.editedIndex = this.shelvesListData.indexOf(item);
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
        Object.assign(this.shelvesListData[this.editedIndex], this.editedItem);
      }
      // We are not adding shelf yet. So commenting out the following line
      /*
      else {
        this.shelvesListData.push(this.editedItem);
      }
      */
      this.close();
    }
  }
};
</script>

<style scoped>

</style>
