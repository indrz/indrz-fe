import axios from 'axios';
import api from '@/util/api';
import config from '@/util/indrzConfig';

export const state = () => ({
  shelves: {
    data: [],
    total: 0
  }
});

export const mutations = {
  setShelves (state, { data = [], total = 0 }) {
    state.shelves = { data, total };
  }
};

export const actions = {
  async LOAD_SHELVES ({ commit }, payload) {
    const endPoint = `bookway/shelf/QP 400`;
    const urlWithParams = payload ? `${'?' + Object.keys(payload).map(key => key + '=' + payload[key]).join('&')}` : '';

    const { data } = await api.request({
      endPoint: `${endPoint}${urlWithParams}`
    });

    const shelvesData = {
      data: data.results,
      total: data.count
    };

    commit('setShelves', shelvesData);
  },

  SAVE_SHELF ({ commit }, payload) {
    const url = `${config.baseApiUrl}/shelf/${payload.id}/`;

    return axios({
      method: 'PUT',
      url: url,
      data: payload,
      headers: {
        Authorization: config.token,
        'Content-Type': 'application/json'
      }
    });
  }
};

export const getters = {};
