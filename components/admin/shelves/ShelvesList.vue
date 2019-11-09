<template>
  <div>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="shelvesListData"
      :server-items-length="total"
      :single-select="singleSelect"
      item-key="id"
      :options.sync="pagination"
      show-select
      class="elevation-1"
      :loading="loading"
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
      <template v-slot:item.map="{ item }">
        <v-icon
          small
        >
          mdi-map
        </v-icon>
      </template>
      <template v-slot:item.edit="{ item }">
        <v-icon
          small
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import api from '../../../util/api';
import AddEditShelf from './AddEditShelf';

export default {
  name: 'ShelvesList',
  components: { AddEditShelf },
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
          text: 'System From',
          align: 'right',
          sortable: false,
          value: 'system_from'
        },
        {
          text: 'System To',
          align: 'right',
          sortable: false,
          value: 'system_to'
        },
        {
          text: 'Shelf Side',
          align: 'right',
          sortable: false,
          value: 'side'
        },
        { text: 'Map', value: 'map', sortable: false, width: '56px' },
        { text: 'Edit', value: 'edit', sortable: false, width: '56px' }
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
    }
  },
  computed: {
    ...mapState({
      shelvesListData: function (state) {
        const { data, total } = state.user.shelves;
        this.total = total;

        return data;
      }
    }),
    formTitle () {
      return this.editedIndex === -1 ? 'New Shelf' : 'Edit Shelf'
    }
  },
  watch: {
    dialog (val) {
      val || this.close()
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
    loadData () {
      if (this.loading) {
        return;
      }

      this.loading = true;

      this
        .$store
        .dispatch('user/LOAD_SHELVES', {
          ...api.getPageParams(this.pagination)
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          this.loading = false
        })
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
        this.editedIndex = -1
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
}
</script>

<style scoped>

</style>
