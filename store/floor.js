import api from '~/util/api';

export const state = () => ({
  floors: []
});

export const mutations = {
  SET_FLOORS (state, floors) {
    state.floors = floors;
  }
};

export const actions = {
  async LOAD_FLOORS ({ commit }) {
    const response = await api.request({
      endPoint: 'floor/'
    }, {
      baseApiUrl: process.env.BASE_API_URL,
      token: process.env.TOKEN
    });
    commit('SET_FLOORS', response?.data?.results || []);
  }
};

export const getters = {
  floors: state => () => {
    return state.floors;
  }
};
