import axios from 'axios';

const baseUrl = 'https://campusplan.aau.at/en/bookway/api';
// const baseUrl = 'http://localhost:8000/api/v1/bookshelf'
const authorization = 'Token a6e744b52ce4515e30602ac8de7337ee36262ea7';

export default {
  setShelves (state, { data = [], total = 0 }) {
    state.shelves = { data, total };
  },
  async LOAD_SHELVES ({ commit }, payload) {
    const url = `${baseUrl}/shelf/`;
    const urlWithParams = payload
      ? `${url + '?' + Object.keys(payload).map(key => key + '=' + payload[key]).join('&')}`
      : url;

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
  }
  // async SAVE_SHELF ({ commit }, payload) {
  //   const url = `${baseUrl}/shelf/${payload.id}`;
  //
  //   return await axios({
  //     method: 'PUT',
  //     url: url,
  //     data: payload,
  //     headers: {
  //       'Authorization': authorization,
  //       'Content-Type': 'application/json'
  //     }
  //   });
  // }
}
