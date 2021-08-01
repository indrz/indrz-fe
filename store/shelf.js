import axios from 'axios';
import api from '@/util/api';
import config from '@/util/indrzConfig';

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
  selectedShelf: null
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
  }
};

export const actions = {
  async LOAD_BOOKSHELF_LIST ({ commit }, payload) {
    const endPoint = `bookway/bookshelf/`;
    const urlWithParams = api.getURLParamsFromPayLoad(payload);

    const { data } = await api.request({
      endPoint: `${endPoint}${urlWithParams}`
    });

    const shelfListData = {
      data: data.results.features,
      total: data.count
    };
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
