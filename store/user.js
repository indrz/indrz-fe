import * as _ from 'lodash';
import axios from 'axios';
import UserService from '../service/user';
import LocalStorageService from '../service/localStorage';

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
    const userResponse = await UserService.signIn(payload, {
      baseApiUrl: process.env.BASE_API_URL
    });
    if (userResponse && userResponse.data) {
      commit('SET_USER', userResponse.data);
    }
  },

  SIGN_OUT ({ commit }) {
    commit('SET_USER', null);
    this.$router.push('/admin/login');
  },
  async LOAD_SHELVES ({ commit }, payload) {
    const url = `${process.env.BASE_API_URL}/shelf/`;
    const urlWithParams = payload ? `${url + '?' + Object.keys(payload).map(key => key + '=' + payload[key]).join('&')}` : url;

    try {
      const { data } = await axios({
        method: 'GET',
        url: urlWithParams,
        headers: {
          'Authorization': process.env.TOKEN
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
    const url = `${process.env.BASE_API_URL}/shelf/${payload.id}/`;

    return axios({
      method: 'PUT',
      url: url,
      data: payload,
      headers: {
        'Authorization': process.env.TOKEN,
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
