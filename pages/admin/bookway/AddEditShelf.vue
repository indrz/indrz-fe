<template>
  <v-dialog :value="dialog" persistent max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ title }}</span>
      </v-card-title>

      <v-card-text>
        <v-form>
          <v-container>
            <v-row no-gutters>
              <v-col cols="12" sm="12" md="12">
                <v-text-field v-model="editedItem.bookshelf_id" label="External Shelf ID" />
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field v-model="editedItem.floor" label="Floor Number" />
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field v-model="editedItem.external_id" label="External Shelf Section" />
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field v-model="editedItem.system_to" label="Shelving System End Value" />
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field v-model="editedItem.system_from" label="Shelving System Start Value" />
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field v-model="editedItem.side" label="Left or Right Side" />
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field v-model="editedItem.measure_from" label="Distance From Measure" />
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field v-model="editedItem.measure_to" label="Distance End Measure" />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text :disabled="loading" @click="close">
          Cancel
        </v-btn>
        <v-btn color="blue darken-1" text :loading="loading" :disabled="loading" @click="save">
          Save<v-icon right>
            mdi-save
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AddEditShelf',
  props: [
    'title',
    'dialog',
    'editedItem'
  ],
  data () {
    return {
      loading: false
    }
  },
  methods: {
    close () {
      this.$emit('close');
    },
    save () {
      this.loading = true;
      this.$store.dispatch('SAVE_SHELF', this.editedItem)
        .then((response) => {
          this.$emit('save');
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
}
</script>

<style scoped>

</style>
