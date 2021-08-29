<template>
  <v-dialog :value="show" fullscreen transition="dialog-bottom-transition">
    <v-card class="ma-2">
      <!--<v-toolbar
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
      </v-toolbar>-->
      <v-card-text class="pa-0">
        <shelf-map ref="shelfMap" v-if="show" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <div class="headline">
          {{ title }}
        </div>
        <v-spacer />
        <v-btn :disabled="loading" @click="close" color="blue darken-1" text>
          Cancel
        </v-btn>
        <v-btn
          :disabled="loading"
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
import ShelfMap from './ShelfMap';

export default {
  name: 'DrawShelf',
  components: { ShelfMap },
  props: {
    title: {
      type: String,
      default: function () {
        return '';
      }
    },
    show: {
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
      loading: false
    }
  },
  methods: {
    ...mapActions({
      saveShelf: 'shelf/SAVE_SHELF'
    }),
    close () {
      this.$emit('close');
    },
    save () {
      const shelf = this.$refs.shelfMap.shelf;

      if (shelf && shelf.getGeometry().getCoordinates()) {
        this.$emit('save', shelf.getGeometry().getCoordinates())
      }

      this.close();
    }
  }
}
</script>

<style scoped>
</style>
