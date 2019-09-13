<template>
  <v-card
    class="mx-auto floor-changer"
    max-height="200px"
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
        },
        {
          text: '4'
        },
        {
          text: '5'
        },
        {
          text: '6'
        },
        {
          text: '7'
        },
        {
          text: '8'
        },
        {
          text: '9'
        }
      ]
    }
  }
}
</script>

<style scoped>
  .floor-changer {
    position: absolute;
    right: 10px;
    top: 70px;
    overflow-y: auto;
  }
</style>
