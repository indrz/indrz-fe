import api from '@/util/api';

export const state = () => ({
  buildings: [],
  floors: []
});

export const mutations = {
  SET_BUILDINGS (state, buildings) {
    state.buildings = buildings;
  },
  SET_FLOORS (state, floors) {
    state.floors = floors;
  }
};

export const actions = {
  async LOAD_BUILDINGS ({ commit, getters, dispatch }) {
    const response = await api.request({
      endPoint: 'buildings/'
    });
    commit('SET_BUILDINGS', response?.data?.results || []);

    const buildingId = getters.firstBuilding();

    await dispatch('LOAD_FLOORS', buildingId);
  },
  async LOAD_FLOORS ({ commit, getters }, buildingId) {
    if (!buildingId) {
      buildingId = getters.firstBuilding();
    }
    const response = await api.request({
      endPoint: `buildings/${buildingId}/floors/`
    });
    commit('SET_FLOORS', response?.data || []);
  }
};

export const getters = {
  firstBuilding: state => () => {
    return state.buildings && state.buildings.length ? state.buildings[0].id : null;
  },
  getBuildingName: state => (id) => {
    let name = '';
    const building = state.buildings.find(building => building.id === id);

    if (building) {
      name = building.building_name;
    }
    return name || id;
  }
};
