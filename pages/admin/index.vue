<template>
  <div>
    <v-layout
      justify-center
      align-center
    >
      <v-col cols="12">
        <v-row
          align="center"
          justify="center"
        >
          <div class="text-center">
            <v-dialog
              v-model="dialog"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  large
                  dark
                  class="pa-4 ma-4"
                  v-on="on"
                >
                  <v-icon left>
                    mdi-plus
                  </v-icon>
                  Create Tournament
                </v-btn>
              </template>
              <new-tournament :dialog="dialog" @onDialogFlagChange="dialog=false" />
            </v-dialog>
          </div>
          <v-btn
            large
            dark
            class="pa-4 ma-4"
            @click.stop="onViewTournamentClick"
          >
            <v-icon left>
              mdi-eye
            </v-icon>
            View Tournament
          </v-btn>
        </v-row>
      </v-col>
    </v-layout>
  </div>
</template>

<script>
export default {
  name: 'Index',
  layout: 'admin'
}
</script>

<style scoped>

</style>
