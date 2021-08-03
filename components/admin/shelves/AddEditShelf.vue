<template>
  <v-dialog :value="dialog" persistent scrollable max-width="500px">
    <v-card>
      <v-toolbar
        dense
        flat
      >
        <div class="headline">
          {{ title }}
        </div>
        <v-spacer />
        <v-btn @click="close" icon>
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-form>
          <v-container>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="editedItem.external_id" label="External Id" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="editedItem.geom" label="Geometry" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="editedItem.left_from_label" label="Left From Label" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="editedItem.left_to_label" label="Left To Label" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="editedItem.right_from_label" label="Right From Label" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="editedItem.right_to_label" label="Right To Label" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-select
                  v-model="editedItem.building"
                  :items="buildings"
                  item-text="building_name"
                  item-value="id"
                  label="Building"
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-select
                  v-model="editedItem.building_floor"
                  :items="floors"
                  item-text="short_name"
                  item-value="id"
                  label="Building Floor"
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field type="number" min="0" v-model="editedItem.length" label="Length in m" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field type="number" min="0" v-model="editedItem.width" label="Width in m" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field type="number" min="0" v-model="editedItem.depth" label="Depth in m" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field type="number" v-model="editedItem.rotation" label="Rotation angle" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-select
                  v-model="editedItem.double_sided"
                  :items="doubleSidedItems"
                  item-text="text"
                  item-value="value"
                  label="Does the shelf have two sides"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="loading" @click="close">
          Cancel
        </v-btn>
        <v-btn
          :disabled="loading"
          :loading="loading"
          @click="save"
          outlined
          color="primary"
        >
          <v-icon left>
            mdi-content-save
          </v-icon>
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'AddEditShelf',
  props: {
    title: {
      type: String,
      default: function () {
        return '';
      }
    },
    dialog: {
      type: Boolean,
      default: function () {
        return false;
      }
    },
    editedItem: {
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  data () {
    return {
      loading: false,
      doubleSidedItems: [
        { text: 'Unknown', value: null },
        { text: 'Yes', value: true },
        { text: 'No', value: false }
      ]
    };
  },
  computed: {
    ...mapState({
      floors: state => state.floor.floors,
      buildings: state => state.building.buildings
    })
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
};
</script>

<style scoped>

</style>
