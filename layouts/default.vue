<template>
  <v-app dark>
    <v-main>
      <div class="box">
        <div :id="headerId" class="header">
          <!-- Any code below will show up on Header -->
        </div>
        <v-container class="content">
          <nuxt />
        </v-container>
        <div :id="footerId" class="footer">
          <!-- Any code below will show up on Footer -->
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import queryString from 'query-string';

export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      headerId: 'indrz-header-container',
      footerId: 'indrz-footer-container',
      items: [
        {
          icon: 'mdi-apps',
          title: 'Home',
          to: '/'
        }
      ],
      miniVariant: false
    };
  },
  created: function () {
    const currentLocale = this.getLocale();
    let defaultLocale = 'en';

    if (currentLocale.includes('de')) {
      defaultLocale = 'de';
    }
    this.$i18n.locale = defaultLocale;
  },
  mounted () {
    const query = queryString.parse(location.search);
    this.showHideHeaderFooter(query);
  },
  methods: {
    getLocale () {
      return (
        navigator.language ||
        navigator.browserLanguage ||
        (navigator.languages || ['en'])[0]
      );
    },
    showHideHeaderFooter (query) {
      if (query.hideHeader && query.hideHeader === 'true') {
        document.getElementById(this.headerId).style.display = 'none';
      }
      if (query.hideFooter && query.hideFooter === 'true') {
        document.getElementById(this.footerId).style.display = 'none';
      }
    }
  }
};
</script>

<style>
.box {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.box .header {
  flex: 0 1 auto;
}

.box .content {
  flex: 1 1 auto;
  max-width: 100%;
  padding: 0px;
  margin: 0px;
}

.box .footer {
  flex: 0 1 auto;
}
</style>
