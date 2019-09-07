<template>
  <div>
    <campus-locations />
    <route />
  </div>
</template>

<script>
import CampusLocations from './CampusLocations';
import Route from './Route';

export default {
  name: 'SideBar',
  components: {
    CampusLocations,
    Route
  },
  props: {
    'menuItems': {
      type: Array,
      default: () => []
    }
  }
}
</script>
