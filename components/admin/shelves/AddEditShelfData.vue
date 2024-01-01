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
                <v-text-field v-model="currentShelfData.external_id" :rules="requiredRule" label="External Id" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="currentShelfData.section_main" label="Main Section" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="currentShelfData.section_child" label="Sub Section" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field
                  v-model="currentShelfData.system_from"
                  :rules="requiredRule"
                  label="Shelving System Start"
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field
                  v-model="currentShelfData.system_to"
                  :rules="requiredRule"
                  label="Shelving System End"
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-select
                  v-model="currentShelfData.side"
                  :items="leftOrRightItems"
                  item-text="text"
                  item-value="value"
                  label="Side"
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field
                  v-model="currentShelfData.measure_from"
                  type="number"
                  min="0"
                  step="0.01"
                  label="Distance from measure"
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field
                  v-model="currentShelfData.measure_to"
                  type="number"
                  min="0"
                  step="0.01"
                  label="Distance to measure"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="loading" @click="close" color="blue darken-1" text>
          Cancel
        </v-btn>
        <v-btn
          :disabled="loading || !valid"
          :loading="loading"
          @click="save"
          color="blue darken-1"
          text
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
import { mapActions } from 'vuex';

export default {
  name: 'AddEditShelfData',
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
    currentShelfData: {
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
      leftOrRightItems: [
        { text: 'Unknown', value: null },
        { text: 'Left', value: 'L' },
        { text: 'Right', value: 'R' }
      ],
      requiredRule: [
        v => !!v || 'This field is required.'
      ]
    };
  },
  watch: {
    dialog: function (newValue) {
      if (newValue === true && !this.currentShelfData.id && this.$refs?.form) {
        this.$refs.form.resetValidation();
      }
    }
  },
  methods: {
    ...mapActions({
      saveShelfData: 'shelf/SAVE_SHELF_DATA'
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

      await this.saveShelfData(this.currentShelfData);

      this.loading = false;
      this.close();
    }
  }
};
</script>

<style scoped>

</style>
