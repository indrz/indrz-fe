<template>
  <v-expansion-panels>

     <v-expansion-panel>
       <v-expansion-panel-header>{{title}}</v-expansion-panel-header>

        <v-expansion-panel-content>
          <slot />
        </v-expansion-panel-content>

     </v-expansion-panel>

</v-expansion-panels>
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
