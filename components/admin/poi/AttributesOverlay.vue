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
                  <v-textarea
                    v-model="data.html_content"
                    label="HTML Content"
                    rows="3"
                    no-resize
                    row-height="25"
                  />
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
                    :disabled="isLoading"
                    @change="onImageUpload"
                  />
                  <v-list
                    dense
                    style="max-height: 120px"
                    class="overflow-y-auto"
                  >
                    <div v-for="(image) in data.images" :key="image.id">
                      <!-- <v-divider
                        v-if="index !== 0"
                        :key="`${index}-divider`"
                      /> -->
                      <v-list-item
                        class="pl-0"
                      >
                        <v-alert
                          color="success"
                          class="white--text text-center pa-1 ma-0"
                          width="100%"
                          v-text="imageName(image)"
                        />

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
            @click="onDeletePoiClick"
          >
            <v-icon left>
              mdi-delete
            </v-icon>
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
      <confirm-dialog
        :show="showConfirmPoiImageDelete"
        :busy="isLoading"
        @cancelClick="showConfirmPoiImageDelete = false"
        @confirmClick="deletePoiImage"
      />
      <confirm-dialog
        :show="showConfirmPoiDelete"
        :busy="isLoading"
        @cancelClick="showConfirmPoiDelete = false"
        @confirmClick="deletePoi"
      />
    </div>
  </div>
</template>

<script>
import ConfirmDialog from '@/components/ConfirmDialog';

export default {
  name: 'AttributesOverlay',
  components: {
    ConfirmDialog
  },
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
      isLoading: false,
      showConfirmPoiDelete: false,
      showConfirmPoiImageDelete: false,
      selectedPoiImageId: null,
      data: {
        type: Object,
        default: function () {
          return {
            name: '',
            name_en: '',
            name_de: '',
            html_content: '',
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
        this.isLoading = true;
        this.$emit('uploadImage', {
          poiId: this.feature.getId(),
          imageFile: this.imageFile
        });
        this.imageFile = null;
      }
    },
    deletePoi () {
      this.isLoading = true;
      this.$emit('deleteClick', {
        data: this.data,
        feature: this.feature
      })
      this.showConfirmPoiDelete = false;
    },
    onDeletePoiClick () {
      this.showConfirmPoiDelete = true;
    },
    deletePoiImage () {
      this.isLoading = true;
      this.$emit('poiImageDeleteClick', {
        id: this.selectedPoiImageId,
        feature: this.feature
      })
    },
    onPoiImageDeleteClick (imageId) {
      this.showConfirmPoiImageDelete = true;
      this.selectedPoiImageId = imageId;
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
      this.isLoading = false;
      this.selectedPoiImageId = null;
      this.showConfirmPoiImageDelete = false;
    },
    imageName (image) {
      if (image.image) {
        return image.image.split('/').pop()
      }
      return image.alt_text
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
