import api from '@/util/api';

const shelfEndpoint = `bookway/bookshelf/`;

const initialShelves = {
  data: [],
  total: 0
};
const initialShelfData = {
  data: [],
  total: 0
};

export const state = () => ({
  shelves: initialShelves,
  shelfData: initialShelfData,
  selectedShelf: null,
  lastShelfQuery: null
});

export const mutations = {
  setShelves (state, { data = [], total = 0 }) {
    state.shelves = { data, total };
  },
  setSelectedShelf (state, shelf) {
    state.selectedShelf = shelf;
  },
  setShelfData (state, shelfData) {
    state.shelfData = shelfData;
  },
  setLastShelfQuery (state, query) {
    state.lastShelfQuery = query;
  }
};

export const actions = {
  async LOAD_BOOKSHELF_LIST ({ commit }, query) {
    const urlWithParams = api.getURLParamsFromPayLoad(query);

    const { data } = await api.request({
      endPoint: `${shelfEndpoint}${urlWithParams}`
    });

    const shelfListData = {
      data: data.results.features,
      total: data.count
    };
    commit('setLastShelfQuery', query);
    commit('setShelves', shelfListData);
    commit('setShelfData', initialShelfData);
    commit('setSelectedShelf', null);
  },

  SET_SELECTED_SHELF ({ commit }, shelf) {
    commit('setSelectedShelf', shelf);

    if (!shelf) {
      commit('setShelfData', initialShelfData);
      return;
    }
    const shelfData = getShelfData(shelf.id, api.getPageParams({}));

    commit('setShelfData', shelfData);
  },

  async SAVE_SHELF ({ state, commit, dispatch }, data) {
    let apiRequest = api.postRequest;
    let endPoint = shelfEndpoint;

    if (data.id) {
      apiRequest = api.putRequest;
      endPoint = `${shelfEndpoint}${data.id}`
    }

    const response = await apiRequest({
      data: data,
      endPoint
    });

    await dispatch('LOAD_BOOKSHELF_LIST', state.lastShelfQuery);

    return response.data;
  },

  async DELETE_SHELF ({ state, commit, dispatch }, data) {
    const response = await api.postRequest({
      endPoint: `${shelfEndpoint}${data.id}`,
      method: 'DELETE',
      data: {}
    });

    await dispatch('LOAD_BOOKSHELF_LIST', state.lastShelfQuery);

    return response.data;
  }
};

export const getters = {};

const getShelfData = (shelfId, payLoad) => {
  /* const endPoint = `bookway/${shelfId}/shelfdata`;
  const urlWithParams = api.getURLParamsFromPayLoad(payLoad);

  const response = await api.request({
    endPoint: `${endPoint}${urlWithParams}`
  });
  console.log(response); */
  // TODO following is the sample response which need to remove once API implemented this endpoint;

  const sampleJSON = {
    'count': 276,
    'next': 'http://0.0.0.0/api/v1/bookway/shelfdata/?format=json&limit=50&offset=50',
    'previous': null,
    'results': [
      {
        'id': 2,
        'building_floor': 68,
        'building': 2,
        'external_id': 'A',
        'section_main': null,
        'section_child': null,
        'system_from': 'QP 100 B864',
        'system_to': 'QP 120 G983 -3(8)',
        'side': 'R',
        'measure_from': null,
        'measure_to': null,
        'bookshelf': null
      },
      {
        'id': 3,
        'building_floor': 68,
        'building': 2,
        'external_id': 'B',
        'section_main': null,
        'section_child': null,
        'system_from': 'QP 120 H136 (6)',
        'system_to': 'QP 120 R352',
        'side': 'L',
        'measure_from': null,
        'measure_to': null,
        'bookshelf': null
      },
      {
        'id': 4,
        'building_floor': 68,
        'building': 2,
        'external_id': 'B',
        'section_main': null,
        'section_child': null,
        'system_from': 'QP 120 S182(6)',
        'system_to': 'QP 120 W959',
        'side': 'R',
        'measure_from': null,
        'measure_to': null,
        'bookshelf': null
      },
      {
        'id': 5,
        'building_floor': 68,
        'building': 2,
        'external_id': 'C',
        'section_main': null,
        'section_child': null,
        'system_from': 'QP 140 A325',
        'system_to': 'QP 150 K94 C8',
        'side': 'L',
        'measure_from': null,
        'measure_to': null,
        'bookshelf': null
      },
      {
        'id': 6,
        'building_floor': 68,
        'building': 2,
        'external_id': 'C',
        'section_main': null,
        'section_child': null,
        'system_from': 'QP 150 L141',
        'system_to': 'QP 160 W583',
        'side': 'R',
        'measure_from': null,
        'measure_to': null,
        'bookshelf': null
      },
      {
        'id': 7,
        'building_floor': 68,
        'building': 2,
        'external_id': 'D',
        'section_main': null,
        'section_child': null,
        'system_from': 'QP 200 G736',
        'system_to': 'QP 210 H999',
        'side': 'L',
        'measure_from': null,
        'measure_to': null,
        'bookshelf': null
      },
      {
        'id': 8,
        'building_floor': 68,
        'building': 2,
        'external_id': 'D',
        'section_main': null,
        'section_child': null,
        'system_from': 'QP 210 I28',
        'system_to': 'QP 215 W972 (2)',
        'side': 'R',
        'measure_from': null,
        'measure_to': null,
        'bookshelf': null
      },
      {
        'id': 9,
        'building_floor': 68,
        'building': 2,
        'external_id': 'E',
        'section_main': null,
        'section_child': null,
        'system_from': 'QP 220 B869',
        'system_to': 'QP 230 F953 (4)',
        'side': 'L',
        'measure_from': null,
        'measure_to': null,
        'bookshelf': null
      },
      {
        'id': 10,
        'building_floor': 68,
        'building': 2,
        'external_id': 'E',
        'section_main': null,
        'section_child': null,
        'system_from': 'QP 230 G137',
        'system_to': 'QP 230 O89 (2)',
        'side': 'R',
        'measure_from': null,
        'measure_to': null,
        'bookshelf': null
      },
      {
        'id': 11,
        'building_floor': 68,
        'building': 2,
        'external_id': 'F',
        'section_main': null,
        'section_child': null,
        'system_from': 'QP 230 P239',
        'system_to': 'QP 240 W959 P9',
        'side': 'L',
        'measure_from': null,
        'measure_to': null,
        'bookshelf': null
      },
      {
        'id': 12,
        'building_floor': 68,
        'building': 2,
        'external_id': 'F',
        'section_main': null,
        'section_child': null,
        'system_from': 'QP 300 A162',
        'system_to': 'QP 300 F988',
        'side': 'R',
        'measure_from': null,
        'measure_to': null,
        'bookshelf': null
      }
    ]
  };

  return {
    data: sampleJSON.results,
    total: sampleJSON.count
  };
};
