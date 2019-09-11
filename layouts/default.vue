<template>
  <v-app dark>
    <v-content>
      <v-container
        class="fill-height pa-0"
        fluid
      >
        <nuxt />
      </v-container>
    </v-content>

  </v-app>
</template>

<script>

export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Home',
          to: '/'
        }
      ],
      miniVariant: false
    }
  }
}
</script>
