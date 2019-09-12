<template>
    <v-toolbar
      dense
      collapse
      flat
      floating
      class="ma-2"
      :class="toolbarClass"
      color="transparent"
    >
        <template>
          <v-btn :color="btnColor" dark class="ma-1">
            <v-icon dark>mdi-home</v-icon>
          </v-btn>
          <v-btn :color="btnColor" dark class="ma-1">
            <v-icon dark>mdi-share</v-icon>
          </v-btn>
          <v-btn :color="btnColor" dark class="ma-1">
            <v-icon dark>mdi-download</v-icon>
          </v-btn>
          <v-btn :color="btnColor" class="ma-1">
            <v-icon>mdi-file-pdf-outline</v-icon>
          </v-btn>
        </template>
      </v-toolbar>
</template>

<script>
export default {
  data () {
    return {
      btnColor: 'rgba(0,60,136,0.5)'
    }
  },
  computed: {
    toolbarClass () {
      return this.$vuetify.breakpoint.mdAndUp ? 'position-large' : 'position-small';
    }
  }
}
</script>

<style scoped>
.position-small {
  top: 60px;
}
.position-large {
  left: 350px;
}
</style>
