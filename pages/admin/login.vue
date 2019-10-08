<template>
  <div id="app">
    <div id="login">
      <v-container xs12>
        <v-row
          align="center"
          justify="center"
        >
          <span class="v-card__title">Welcome to Indrz</span>
        </v-row>
        <br>
        <span class="v-card__text">Please login</span>

        <template>
          <v-form ref="loginForm" lazy-validation @submit.prevent="onSignIn" v-model="valid">
            <v-container>
              <v-layout row wrap>
                <v-flex xs12 sm6>
                  <v-text-field
                    key="login-username"
                    v-model="username"
                    name="username"
                    label="User Name"
                    :rules="[formRules.required]"
                    prepend-icon="mdi-account"
                    required
                  />
                </v-flex>

                <v-flex xs12 sm6>
                  <v-text-field
                    key="login-password"
                    v-model="password"
                    name="password"
                    label="Password"
                    prepend-icon="mdi-lock"
                    type="password"
                    :rules="[formRules.required]"
                    required
                  />
                </v-flex>
              </v-layout>
              <v-layout row wrap v-if="noUser" class="subheader-2 justify-center error--text">
                User name or password is not valid!
              </v-layout>
              <v-layout row wrap>
                <v-btn type="submit" block color="primary" :disabled="!valid">
                  Login
                </v-btn>
              </v-layout>
            </v-container>
          </v-form>
        </template>
      </v-container>
    </div>
  </div>
</template>

<script>

import LocalStorageService from '../service/localStorage';

export default {
  name: 'Login',
  data () {
    return {
      username: '',
      password: '',
      valid: true,
      noUser: false,
      formRules: {
        required: value => !!value || 'This is a required field.'
      }
    }
  },

  mounted () {
    const tokenData = LocalStorageService.getTokenData();
    if (tokenData && tokenData.token) {
      this.$store.commit('user/SET_USER', tokenData)
      this.$router.push(this.$route.query.redirect || '/');
    }
  },

  methods: {
    async onSignIn () {
      if (!this.$refs.loginForm.validate()) {
        return;
      }
      try {
        await this
          .$store
          .dispatch('user/SIGN_IN', {
            username: this.username,
            password: this.password
          });

        if (this.$store.getters['user/isUserSignedIn']) {
          this.$router.push(this.$route.query.redirect || '/');
          this.noUser = false;
          return;
        }
        this.noUser = true;
      } catch (error) {
        console.log(error.message)
      }
    }
  }
}
</script>

<style scoped>

</style>
