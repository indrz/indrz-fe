import * as _ from 'lodash';
import axios from 'axios';
import UserService from '../service/user';
import LocalStorageService from '../service/localStorage';

// const baseUrl = 'http://localhost:8000/api/v1';
// const baseUrl = 'https://tu.indrz.com/api/v1';
// const baseUrl = 'https://campusplan.aau.at/api/v1'; // AAU
const baseUrl = 'https://tuw-maps.tuwien.ac.at/api/v1';
// const authorization = 'Token a6e744b52ce4515e30602ac8de7337ee36262ea7'; //AAU
const authorization = 'Token 42519ebe7bada4d7a151c76832b94614ea5b198d'; // TU tuw-maps.tuwien.ac.at
// const authorization = 'Token 42519ebe7bada4d7a151c76832b94614ea5b198d'; // TU tu.indrz.com

export const state = () => ({
  user: null,
  shelves: {
    data: [],
    total: 0
  }
});

export const mutations = {
  SET_USER (state, user) {
    state.user = user;
    if (user) {
      LocalStorageService.setToken(state.user);
    } else {
      LocalStorageService.removeToken();
    }
  },
  setShelves (state, { data = [], total = 0 }) {
    state.shelves = { data, total };
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
    this.$router.push('/admin/login');
  },
  async LOAD_SHELVES ({ commit }, payload) {
    const url = `${baseUrl}/shelf/`;
    const urlWithParams = payload ? `${url + '?' + Object.keys(payload).map(key => key + '=' + payload[key]).join('&')}` : url;

    try {
      const { data } = await axios({
        method: 'GET',
        url: urlWithParams,
        headers: {
          'Authorization': authorization
        }
      });

      const shelvesData = {
        data: data.results,
        total: data.count
      };

      commit('setShelves', shelvesData);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  SAVE_SHELF ({ commit }, payload) {
    const url = `${baseUrl}/shelf/${payload.id}/`;

    return axios({
      method: 'PUT',
      url: url,
      data: payload,
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      }
    });
  }
};

export const getters = {
  isUserSignedIn (state) {
    return !_.isNil(state.user);
  },
  userEmail (state) {
    return state.user ? state.user.username : ''
  }
};
