<template>
  <v-dialog
    v-model="dialog"
    max-width="700"
  >
    <v-card>
      <v-card-title class="headline" />
      <v-card-text>
        <h1>Terms and Conditions</h1>
        <p>Lorem Ipsum</p>
        <h1>Contact</h1>
        <p>Please contact test@tuwien.ac.at  to report any issues or problems with the map.</p>
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
