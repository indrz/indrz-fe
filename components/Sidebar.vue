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
      title: {
        campus_locations: this.$t('campus_locations'),
        route: this.$t('route'),
        pointsOfInterest: this.$t('points_of_interest')
      }
    }
  },
  computed: {
    menuItems () {
      return [
        {
          type: 'CampusLocations',
          title: this.title.campus_locations
        },
        {
          type: 'Route',
          title: this.title.route
        },
        {
          type: 'PointsOfInterest',
          title: this.title.pointsOfInterest
        }
      ]
    }
  }
}
</script>
