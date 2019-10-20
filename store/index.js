export const state = () => ({
  locales: ['en', 'de'],
  locale: 'en'
})

export const mutations = {
  SET_LANG (state, locale) {
    if (state.locales.includes(locale)) {
      state.locale = locale
    }
  }
}
/*
export const state = () => ({
  user: {}
});

export const mutations = {};

export const actions = {
  nuxtServerInit ({ commit }, { req }) {
    if (req && req.user) {
      commit('user/SET_USER', req.user)
    }
  }
};
*/
