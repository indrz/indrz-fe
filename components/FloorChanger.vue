<template>
  <v-card
    class="mx-auto position"
  >
    <v-list dense>
      <v-list-item-group v-model="model" mandatory color="primary">
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
        >
          <v-list-item-content>
            <v-list-item-title v-text="item.text" />
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

<script>
export default {
  data () {
    return {
      model: 1,
      items: [
        {
          text: '1'
        },
        {
          text: '2'
        },
        {
          text: '3'
        }
      ]
    }
  }
}
</script>

<style scoped>
  .position {
    position: absolute;
    right: 10px;
    top: 70px;
  }
</style>
