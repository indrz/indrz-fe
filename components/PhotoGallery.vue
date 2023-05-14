<template>
  <v-dialog
    v-model="dialog"
    max-width="700"
  >
    <v-card>
      <v-toolbar
        flat
      >
        <v-spacer />
        <v-btn
          icon
          @click="dialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-carousel :value="selctedIndex">
          <v-carousel-item
            v-for="(item,i) in images"
            :key="i"
            :src="`${baseUrl}${item.image}`"
          />
        </v-carousel>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import config from '@/util/indrzConfig'

const { env } = config;

export default {
  name: 'PhotoGallery',

  props: {
    show: {
      type: Boolean,
      default: function () {
        return false;
      }
    },
    images: {
      type: Array,
      default: function () {
        return [];
      }
    },
    selctedIndex: {
      type: Number,
      default: function () {
        return 0;
      }
    }
  },
  data () {
    return {};
  },
  computed: {
    dialog: {
      get: function () {
        return this.show;
      },
      set: function (newValue) {
        this.$emit('gallery:show', newValue);
      }
    },
    baseUrl () {
      return env.BASE_URL
    }
  }
};
</script>

<style scoped>

</style>
