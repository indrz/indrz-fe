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
  },
  created: function () {
    const currentLocale = this.getLocale();
    let defaultLocale = 'en';

    if (currentLocale.includes('de')) {
      defaultLocale = 'de';
    }
    this.$i18n.locale = defaultLocale;
  },
  methods: {
    getLocale () {
      return navigator.language || navigator.browserLanguage || (navigator.languages || ['en'])[0];
    }
  }
}
</script>
