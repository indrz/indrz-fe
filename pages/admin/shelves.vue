<template>
  <v-container>
    <v-row>
      <v-col>
        <book-shelf-list />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <shelf-data-list />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import BookShelfList from '@/components/admin/shelves/BookShelfList';
import ShelfDataList from '@/components/admin/shelves/ShelfDataList';
export default {
  layout: 'admin',
  components: {
    ShelfDataList,
    BookShelfList
  }
};
</script>

<style scoped>
</style>
