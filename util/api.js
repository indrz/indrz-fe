import axios from 'axios';

const baseApiUrl = 'https://campusplan.aau.at/en/indrz/api/v1/';

const request = async function (requestObj) {
  try {
    return await axios({
      url: `${baseApiUrl}${requestObj.endPoint}`,
      method: requestObj.method || 'GET',
      headers: {
        'Authorization': 'Token 3d673589ecc8128d7a16286c5f20bdbb5f768381',
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    console.log(err);
    return null;
  }
};

export default {
  request
}
