import api from '~/util/api';

export const state = () => ({
  poiData: [],
  poiIcons: []
});

export const mutations = {
  SET_POI (state, poiData) {
    state.poiData = poiData;
  },
  SET_POI_ICONS (state, poiIcons) {
    state.poiIcons = poiIcons;
  }
};

export const actions = {
  async LOAD_POI ({ commit }) {
    const response = await api.request({
      endPoint: 'poi/tree/'
    }, {
      baseApiUrl: process.env.BASE_API_URL,
      token: process.env.TOKEN
    });
    commit('SET_POI', response.data);
  },

  async LOAD_POI_ICONS ({ commit }) {
    const response = await api.request({
      endPoint: 'poi/icon/'
    }, {
      baseApiUrl: process.env.BASE_API_URL,
      token: process.env.TOKEN
    });
    commit('SET_POI_ICONS', response.data.results);
  }
};

export const getters = {
  findNode: state => (nodeId) => {
    return findNode(Number.parseInt(nodeId), state.poiData);
  }
};

const findNode = (nodeId, poiData) => {
  let foundData = null;

  poiData.some((d) => {
    if (d.id && d.id === nodeId) {
      foundData = d;
      return true;
    }
    if (d.children) {
      foundData = findNode(nodeId, d.children);
      if (foundData) {
        if (!foundData.roots) {
          foundData = {
            data: foundData,
            roots: [d.id]
          };
        } else {
          foundData.roots.push(d.id);
        }
        return true;
      }
    }
  });
  return foundData;
};
