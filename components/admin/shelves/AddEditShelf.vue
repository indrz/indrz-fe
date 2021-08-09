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
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-container>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="currentShelf.external_id" :rules="requiredRule" label="External Id" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="currentShelf.geom" label="Geometry" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="currentShelf.left_from_label" label="Left From Label" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="currentShelf.left_to_label" label="Left To Label" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="currentShelf.right_from_label" label="Right From Label" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="currentShelf.right_to_label" label="Right To Label" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-select
                  v-model="currentShelf.building"
                  :items="buildings"
                  :rules="requiredRule"
                  item-text="building_name"
                  item-value="id"
                  label="Building"
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-select
                  v-model="currentShelf.building_floor"
                  :items="floors"
                  :rules="requiredRule"
                  item-text="short_name"
                  item-value="id"
                  label="Building Floor"
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="currentShelf.length" type="number" min="0" label="Length in m" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="currentShelf.width" type="number" min="0" label="Width in m" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="currentShelf.depth" type="number" min="0" label="Depth in m" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="currentShelf.rotation" type="number" label="Rotation angle" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-select
                  v-model="currentShelf.double_sided"
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
          :disabled="loading || !valid"
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
import { mapState, mapActions } from 'vuex';

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
    currentShelf: {
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  data () {
    return {
      loading: false,
      valid: true,
      doubleSidedItems: [
        { text: 'Unknown', value: null },
        { text: 'Yes', value: true },
        { text: 'No', value: false }
      ],
      requiredRule: [
        v => !!v || 'This field is required.'
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
    ...mapActions({
      saveShelf: 'shelf/SAVE_SHELF'
    }),
    close () {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
      this.$emit('close');
    },
    async save () {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.loading = true;

      await this.saveShelf(this.currentShelf);

      this.loading = false;
      this.close();
    }
  }
};
</script>

<style scoped>

</style>
