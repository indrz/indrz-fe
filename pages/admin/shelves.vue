<template>
  <div>
    <book-shelf-list />
  </div>
</template>

<script>
import BookShelfList from '../../components/admin/shelves/BookShelfList';
export default {
  layout: 'admin',
  components: {
    BookShelfList
  }
};
</script>

<style scoped>
</style>
