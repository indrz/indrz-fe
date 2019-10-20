import * as _ from 'lodash';
import UserService from '../service/user';
import LocalStorageService from '../service/localStorage';

export const state = () => ({
  user: null
});

export const mutations = {
  SET_USER (state, user) {
    state.user = user;
    if (user) {
      LocalStorageService.setToken(state.user);
    } else {
      LocalStorageService.removeToekn();
    }
  }
};

export const actions = {
  async SIGN_IN ({ commit }, payload) {
    const userResponse = await UserService.signIn(payload);
    if (userResponse && userResponse.data) {
      commit('SET_USER', userResponse.data);
    }
  },

  SIGN_OUT ({ commit }) {
    commit('SET_USER', null);
    this.$router.push('/login');
  }
};

export const getters = {
  isUserSignedIn (state) {
    return !_.isNil(state.user);
  },
  userEmail (state) {
    return state.user ? state.user.email : ''
  }
};
