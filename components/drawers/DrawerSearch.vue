<template>
  <v-card-title>
    <v-toolbar
      :max-width="toolbarWidth"
      dense
      rounded
      floating
    >
      <v-app-bar-nav-icon v-if="!isSmallScreen || !shouldShow" @click.stop="attachedDrawer = !attachedDrawer;" />
      <template v-if="isSmallScreen">
        <v-btn icon @click="shouldShow = !shouldShow">
          <v-icon v-if="!shouldShow">
            mdi-magnify
          </v-icon>
          <v-icon v-if="shouldShow">
            mdi-chevron-left
          </v-icon>
        </v-btn>
      </template>
      <v-expand-transition>
        <campus-search
          v-show="!isSmallScreen || shouldShow"
          ref="searchComp"
          :should-search="shouldSearch"
          @selectSearhResult="onSearchSelect"
          @showSearch="shouldShow = true"
          @clearClicked="onClearClick"
        />
      </v-expand-transition>
    </v-toolbar>
  </v-card-title>
</template>

<script>
import CampusSearch from '@/components/CampusSearch'

export default {
  name: 'DrawerSearch',
  components: {
    CampusSearch
  },
  props: {
    drawer: {
      type: Boolean,
      default: function () {
        return false;
      }
    },
    map: {
      type: Object,
      required: true
    },
    searchTitle: {
      type: String,
      default () {
        return ''
      }
    }
  },
  data () {
    return {
      shouldShow: false,
      shouldSearch: true
    };
  },
  computed: {
    isSmallScreen () {
      return this.$vuetify.breakpoint.smAndDown;
    },
    toolbarWidth () {
      return this.isSmallScreen ? '280px' : '320px';
    },
    attachedDrawer: {
      get: function () {
        return this.drawer;
      },
      set: function (newValue) {
        this.$emit('update:drawer', newValue);
      }
    },
    searchField () {
      return this.$refs.searchComp;
    }
  },
  watch: {
    searchTitle (title) {
      this.shouldSearch = false;
      this.searchField.search = title;
      setTimeout(() => {
        this.shouldSearch = true;
      }, 1000)
    }
  },
  methods: {
    onSearchSelect (selectedItem) {
      this.map.onSearchSelect(selectedItem);
    },
    onClearClick () {
      this.$emit('hide-poi-drawer')
    }
  }

};
</script>

<style scoped>

</style>
