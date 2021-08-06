import api from '@/util/api';

export const state = () => ({
  buildings: []
});

export const mutations = {
  SET_BUILDINGS (state, floors) {
    state.buildings = floors;
  }
};

export const actions = {
  async LOAD_BUILDINGS ({ commit }) {
    const response = await api.request({
      endPoint: 'buildings/'
    }, {
      baseApiUrl: process.env.BASE_API_URL,
      token: process.env.TOKEN
    });
    commit('SET_BUILDINGS', response?.data?.results || []);
  }
};

export const getters = {
  getBuildingName: state => (id) => {
    let name = '';
    const building = state.buildings.find(building => building.id === id);

    if (building) {
      name = building.building_name;
    }
    return name || id;
  }
};
