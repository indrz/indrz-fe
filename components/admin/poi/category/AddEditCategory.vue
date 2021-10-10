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
      <v-divider />
      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-container>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="selectedCategory.name" :rules="requiredRule" label="Category name" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-select
                  label="Icon"
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-select
                  label="Parent"
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="selectedCategory.name_en" label="Category name EN" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-text-field v-model="selectedCategory.name_de" label="Category name DE" />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-select
                  v-model="selectedCategory.enabled"
                  :items="activatedOptions"
                  item-text="text"
                  item-value="value"
                  label="Activated"
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
import { mapState, mapActions } from 'vuex';

export default {
  name: 'AddEditCategory',
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
    selectedCategory: {
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
      activatedOptions: [
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
    })
  },
  methods: {
    ...mapActions({
      // saveShelfData: 'shelf/SAVE_SHELF_DATA'
    }),
    close () {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
      this.$emit('close');
    },
    save () {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.loading = true;

      // await this.saveShelfData(this.currentCategoryData);

      this.loading = false;
      this.close();
    }
  }
};
</script>

<style scoped>

</style>
