<template>
  <v-card flat>
    <v-card-text>
      <template v-if="link">
        <v-container>
          <v-row>
            <v-col cols="12" xs="12" sm="10" md="10">
              <v-text-field ref="linkField" :value="link" hide-details outlined />
            </v-col>
            <v-col
              cols="12"
              xs="12"
              sm="2"
              md="2"
              align="end"
              class="pt-5"
            >
              <v-btn @click="onCopyButtonClick('linkField')" color="blue darken-1" text class="pa-0">
                <v-icon dark>
                  mdi-content-copy
                </v-icon>
                Copy
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-else>
        <v-row class="pl-0 ml-0">
          <v-col cols="12" xs="12" sm="10" md="10">
            <v-text-field
              ref="singlePoi"
              :value="poiSingleShareLink"
              :label="poiSingleShareTitle"
              hide-details
              outlined
              readonly
            />
          </v-col>
          <v-col
            cols="12"
            xs="12"
            sm="2"
            md="2"
            align="end"
          >
            <v-btn @click="onCopyButtonClick('singlePoi')" color="blue darken-1" text class="pa-0">
              <v-icon dark>
                mdi-content-copy
              </v-icon>
              Copy
            </v-btn>
          </v-col>
        </v-row>
        <v-row class="pl-0 ml-0 mt-10">
          <v-col cols="12" xs="12" sm="10" md="10">
            <v-text-field
              ref="catPoi"
              :value="poiCatShareLink"
              :label="poiCatShareTitle"
              hide-details
              outlined
              readonly
            />
          </v-col>
          <v-col
            cols="12"
            xs="12"
            sm="2"
            md="2"
            align="end"
          >
            <v-btn @click="onCopyButtonClick('catPoi')" color="blue darken-1" text class="pa-0">
              <v-icon dark>
                mdi-content-copy
              </v-icon>
              Copy
            </v-btn>
          </v-col>
        </v-row>
      </template>
      <v-row>
        <v-col v-if="copyConfirmation" cols="12" sm="8" md="8">
          {{ copySuccess }}
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'ShareLink',
  props: {
    link: {
      type: String,
      default: ''
    },
    poiSingleShareLink: {
      type: String,
      default: ''
    },
    poiCatShareLink: {
      type: String,
      default: ''
    },
    copyConfirmation: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      copySuccess: 'Url successfully copied in to clipboard!',
      poiSingleShareTitle: 'Share the POI',
      poiCatShareTitle: 'Share the POI category'
    }
  },
  methods: {
    onCopyButtonClick (fieldRef) {
      const copyTextField = this.$refs[fieldRef];
      const inputField = copyTextField.$el.querySelector('input');
      inputField.select();
      inputField.setSelectionRange(0, 99999);
      document.execCommand('copy');
      this.$emit('copy');
    }
  }
}
</script>

<style scoped>

</style>
