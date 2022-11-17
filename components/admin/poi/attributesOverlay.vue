<template>
  <div id="attributes-overlay" :style="{'min-width': popupSize.width}" scrollable class="ol-popup indrz-popup">
    <div :style="{'max-height': popupSize.height}">
      <v-card flat>
        <v-toolbar
          dense
          flat
          height="24"
        >
          <!--div class="headline">
            {{ title }}
          </div> -->
          <v-spacer />
          <v-btn @click="onCloseClick" icon>
            <v-icon>
              mdi-window-close
            </v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-0">
          <v-form
            ref="form"
            v-model="valid"
            dense
            lazy-validation
          >
            <v-container class="pa-0">
              <v-row no-gutters>
                <v-col>
                  <v-text-field v-model="data.name" :rules="requiredRule" label="name" />
                  <v-text-field v-model="data.name_en" label="name-en" />
                  <v-text-field v-model="data.name_de" label="name-de" />
                  <v-checkbox
                    v-model="data.enabled"
                    label="enabled"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-divider class="mt-5" />
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="loading" @click="onCloseClick" color="blue darken-1" text>
            Cancel
          </v-btn>
          <v-btn
            :disabled="loading || !valid"
            :loading="loading"
            @click="onCloseClick"
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'AttributesOverlay',
  props: {
  },
  data () {
    return {
      loading: false,
      valid: true,
      requiredRule: [
        v => !!v || 'This field is required.'
      ],
      data: {
        type: Object,
        default: function () {
          return {
            name: '',
            name_en: '',
            name_de: '',
            enabled: true
          };
        }
      }
    }
  },
  computed: {
    popupSize () {
      const size = {
        width: '354px',
        height: '366px'
      };

      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          size.width = '150px';
          size.height = '162px';
          break;
        case 'sm':
          size.width = '270px';
          size.height = '282px';
          break;
      }
      return size;
    }
  },
  methods: {
    onCloseClick () {
      this.$emit('closeClick');
    },
    setData (data) {
      this.data = data;
    }
  }
};
</script>

<style scoped>
  .xs-popup {
    display: flex;
    flex-direction: column;
    align-items: flex-start !important;
  }
</style>
