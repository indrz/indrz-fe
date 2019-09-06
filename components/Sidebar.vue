<template>
  <div>
    <campus-locations />
  </div>
</template>

<script>
import CampusLocations from './CampusLocations';

export default {
  name: 'SideBar',
  components: {
    CampusLocations
  },
  props: {
    'menuItems': {
      type: Array,
      default: () => []
    }
  }
}
</script>
