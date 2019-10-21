export const state = () => ({
  locales: ['en', 'de'],
  locale: 'en',
  snackBar: ''
});

export const mutations = {
  SET_LANG (state, locale) {
    if (state.locales.includes(locale)) {
      state.locale = locale
    }
  },
  SET_SNACKBAR: function (state, val) {
    state.snackBar = val
  }
};
