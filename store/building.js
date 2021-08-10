import api from '@/util/api';

export const state = () => ({
  buildings: [],
  currentBuildingId: null,
  floors: []
});

export const mutations = {
  SET_BUILDINGS (state, buildings) {
    state.buildings = buildings;
  },
  SET_CURRENT_BUILDING (state, buildingId) {
    state.currentBuildingId = buildingId;
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
  async LOAD_FLOORS ({ state, commit, getters }, buildingId) {
    if (!buildingId) {
      buildingId = getters.firstBuilding();
    }

    if (buildingId === state.currentBuildingId) {
      return;
    }
    commit('SET_CURRENT_BUILDING', buildingId);
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
  firstFloor: state => () => {
    return state.floors && state.floors.length ? state.floors[0].id : null;
  },
  getBuildingName: state => (id) => {
    let name = '';
    const building = state.buildings.find(building => building.id === id);

    if (building) {
      name = building.building_name;
    }
    return name || id;
  },
  getFloorName: state => (id) => {
    let name = '';
    const floor = state.floors.find(floor => floor.id === id);

    if (floor) {
      name = floor.short_name;
    }
    return name || id;
  }
};
