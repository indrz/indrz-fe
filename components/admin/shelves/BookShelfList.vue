<template>
  <v-card>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="shelvesListData"
      :server-items-length="total"
      :single-select="singleSelect"
      :options.sync="pagination"
      :loading="loading"
      :height="height"
      @click:row="onShelfClick"
      dense
      item-key="id"
      class="elevation-1"
      loading-text="Loading... Please wait"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Book Shelves</v-toolbar-title>
          <v-spacer />
          <v-text-field
            v-model="search"
            label="Search"
            clearable
            single-line
            hide-details
          />
          <v-divider
            class="mx-4"
            inset
            vertical
          />
          <v-btn
            @click="addBookShelf"
            outlined
          >
            <v-icon left>
              mdi-plus
            </v-icon>
            Book Shelf
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.building="{item}">
        {{ getBuildingName(item.building) }}
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
          @click="editBookShelf(item)"
          small
        >
          mdi-pencil
        </v-icon>
      </template>
      <template v-slot:item.delete="{}">
        <v-icon
          @click="showConfirmDeleteShelf = true"
          small
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
    <add-edit-shelf
      :title="formTitle"
      :dialog="addEditDialog"
      :current-shelf="editedItem"
      @close="addEditDialogClose"
    />
    <confirm-dialog
      :show="showConfirmDeleteShelf"
      :message="deleteShelfConfirmMessage"
      @cancelClick="showConfirmDeleteShelf = false"
      @confirmClick="deleteBookShelf"
    />
  </v-card>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import api from '@/util/api';
import ConfirmDialog from '@/components/ConfirmDialog';
import AddEditShelf from './AddEditShelf';

export default {
  name: 'BookShelfList',
  components: { ConfirmDialog, AddEditShelf },
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
      addEditDialog: false,
      showConfirmDeleteShelf: false,
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
          align: 'left',
          sortable: false,
          value: 'external_id',
          width: 90
        },
        {
          text: 'Building',
          align: 'left',
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
        { text: 'Edit', value: 'edit', sortable: false, filterable: false, width: '56px' },
        { text: 'Delete', value: 'delete', sortable: false, filterable: false, width: '56px' }
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
      },
      deleteShelfConfirmMessage: 'All shelf data will be deleted. DO YOU REALLY WANT TO DELETE THE BOOKSHELF?'
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
      },
      selectedShelf: state => state.shelf.selectedShelf,
      floors: state => state.floor.floors,
      buildings: state => state.building.buildings
    }),
    ...mapGetters({
      getBuildingName: 'building/getBuildingName'
    }),
    formTitle () {
      return this.editedIndex === -1 ? 'New Shelf' : 'Edit Shelf';
    },
    firstFloor () {
      return this.floors && this.floors.length ? this.floors[0].id : null;
    },
    firstBuilding () {
      return this.buildings && this.buildings.length ? this.buildings[0].id : null;
    }
  },
  watch: {
    search (text) {
      this.term$.next(text);
    },
    addEditDialog (val) {
      val || this.addEditDialogClose();
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

    addBookShelf () {
      this.editedItem = Object.assign({
        double_sided: true,
        geom: 'SRID=3857;MULTILINESTRING((1826591.54074498 6142466.7599126,1826596.22332136 6142463.08341735))',
        building: this.firstBuilding,
        building_floor: this.firstFloor
      });
      this.addEditDialog = true;
    },

    editBookShelf (item) {
      this.editedIndex = this.shelvesListData.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.addEditDialog = true;
    },

    deleteBookShelf () {
      this.showConfirmDeleteShelf = false;
      // console.log(this.selectedShelf)
    },

    addEditDialogClose () {
      this.addEditDialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    }
  }
};
</script>

<style scoped>

</style>
