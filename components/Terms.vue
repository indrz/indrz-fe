<template>
  <v-dialog
    v-model="dialog"
    max-width="700"
  >
    <v-card>
      <v-card-title class="headline" />
      <v-card-text>
        <h1>{{ $t('terms_and_conditions') }}</h1>
        <p>Lorem Ipsum</p>
        <h1>{{ contact }}</h1>
        <p>{{ $t('contact_us') }}</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'Terms',

  props: {
    show: {
      type: Boolean,
      default: function () {
        return false
      }
    }
  },
  data () {
    return {
      contact: this.$t('contact')
    }
  },
  computed: {
    dialog: {
      get: function () {
        return this.show;
      },
      set: function (newValue) {
        this.$emit('termsShow', newValue);
      }
    }
  }
}
</script>

<style scoped>

</style>
