<template>
  <div id="attributes-overlay" :style="{'min-width': popupSize.width}" scrollable class="ol-popup indrz-popup">
    <div>
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
          <v-btn icon @click="onCloseClick">
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
                    dense
                  />
                  <v-file-input
                    ref="uploadImage"
                    v-model="imageFile"
                    accept="image/*"
                    label="Image"
                    show-size
                    :rules="imageUploadRules"
                    prepend-icon=""
                    append-icon="mdi-plus"
                    @change="onImageUpload"
                  />
                  <v-list
                    style="max-height: 120px"
                    class="overflow-y-auto"
                  >
                    <div v-for="(image, index) in data.images" :key="image.id">
                      <v-divider
                        v-if="index !== 0"
                        :key="`${index}-divider`"
                      />
                      <v-list-item
                        class="pl-0"
                      >
                        <v-list-item-content>
                          <v-list-item-title v-text="image.alt_text" />
                        </v-list-item-content>

                        <v-list-item-action>
                          <v-btn icon x-small @click="onPoiImageDeleteClick(image.id)">
                            <v-icon color="error darken-1">
                              mdi-delete
                            </v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                    </div>
                  </v-list>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-divider class="mt-5" />
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="onCloseClick">
            Cancel
          </v-btn>
          <v-btn
            :disabled="!valid"
            color="blue darken-1"
            text
            @click="onSaveClick"
          >
            <v-icon left>
              mdi-content-save
            </v-icon>
            Save
          </v-btn>
          <v-spacer />
          <v-btn
            color="error darken-1"
            text
            @click="onDeleteClick"
          >
            <v-icon left>
              mdi-delete
            </v-icon>
            Delete
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
      valid: true,
      requiredRule: [
        v => (v && v.trim().length > 0) || 'This field is required.'
      ],
      imageUploadRules: [
        value => !value || value.size < (20 * 1024000) || 'Image size should be less than 20 MB!'
      ],
      data: {
        type: Object,
        default: function () {
          return {
            name: '',
            name_en: '',
            name_de: '',
            enabled: true,
            images: []
          };
        }
      },
      imageFile: null,
      feature: {
        type: Object,
        default: function () {
          return null;
        }
      }
    }
  },
  computed: {
    popupSize () {
      return {
        width: '354px',
        height: this.feature ? '395px' : '326px'
      };
    }
  },
  methods: {
    onCloseClick () {
      this.$emit('closeClick');
    },
    onSaveClick () {
      this.$emit('saveClick', {
        data: this.data,
        feature: this.feature,
        imageFile: this.imageFile
      })
    },
    onImageUpload () {
      if (!this.imageFile) {
        return;
      }
      if (this.feature) {
        this.$emit('uploadImage', {
          poiId: this.feature.getId(),
          imageFile: this.imageFile
        });
        this.imageFile = null;
      }
    },
    onDeleteClick () {
      this.$emit('deleteClick', {
        data: this.data,
        feature: this.feature
      })
    },
    onPoiImageDeleteClick (id) {
      this.$emit('poiImageDeleteClick', {
        id,
        feature: this.feature
      })
    },
    setData (data, feature) {
      this.data = { ...data };
      if (feature) {
        this.feature = feature;
      } else {
        this.feature = null;
      }
      this.imageFile = null;
    },
    setImages (images) {
      this.data.images = images || [];
      this.imageFile = null;
      this.$refs.uploadImage.reset();
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
