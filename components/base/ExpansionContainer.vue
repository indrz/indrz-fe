<template>
  <div>
    <v-card class="ma-2">
      <v-toolbar dark dense color="grey darken-1" @click="show = !show">
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <div class="flex-grow-1" />
        <v-btn icon small>
          <v-icon>mdi-chevron-{{ show ? 'up' : 'down' }}</v-icon>
        </v-btn>
      </v-toolbar>
      <v-expand-transition>
        <div v-show="show">
          <v-card-text>
            <slot />
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'ExpansionContainer',
  props: {
    title: {
      type: String,
      default: () => ''
    }
  },
  data () {
    return {
      show: false
    };
  }
};
</script>

<style scoped>
</style>
