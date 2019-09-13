<template>
  <div>
    <v-expansion-panels>
      <v-expansion-panel v-for="menuItem in menuItems" :key="menuItem.title">
        <v-expansion-panel-header>{{ menuItem.title }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <component :is="menuItem.type" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-list
      class="mt-5"
      nav
      dense
    >
      <v-list-item-group color="primary">
        <v-list-item
          v-for="(item, i) in menuButtons"
          :key="i"
          @click.stop="onMenuBUttonClick(item)"
        >
          <v-list-item-icon>
            <v-icon>mdi-{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title v-text="item.text" />
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script>
import CampusLocations from './CampusLocations';
import Route from './Route';
import PointsOfInterest from './poi/PointsOfInterest';

export default {
  name: 'SideBar',
  components: {
    CampusLocations,
    Route,
    PointsOfInterest
  },
  data () {
    return {
      locale: {
        campusLocations: this.$t('campus_locations'),
        route: this.$t('route'),
        pointsOfInterest: this.$t('points_of_interest'),
        zooToHome: this.$t('zoom_to_home'),
        shareMap: this.$t('share_map'),
        download: this.$t('download'),
        pdf: this.$t('pdf')
      }
    }
  },

  computed: {
    menuItems () {
      return [
        {
          type: 'CampusLocations',
          title: this.locale.campusLocations
        },
        {
          type: 'Route',
          title: this.locale.route
        },
        {
          type: 'PointsOfInterest',
          title: this.locale.pointsOfInterest
        }
      ]
    },
    menuButtons () {
      return [
        {
          icon: 'home',
          type: 'zoom-home',
          text: this.locale.zooToHome
        },
        {
          icon: 'share',
          type: 'share-map',
          text: this.locale.shareMap
        },
        {
          icon: 'download',
          type: 'download',
          text: this.locale.download
        },
        {
          icon: 'file-pdf-outline',
          type: 'pdf',
          text: this.locale.pdf
        }
      ]
    }
  },

  methods: {
    onMenuBUttonClick (item) {
      this.$emit('menuButtonClick', item.type);
    }
  }
}
</script>
