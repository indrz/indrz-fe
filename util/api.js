import axios from 'axios';
import indrzConfig from '~/util/indrzConfig'

const baseApiUrl = indrzConfig.baseApiUrl;

const request = function (requestObj) {
  return axios({
    url: `${requestObj.url || baseApiUrl}${requestObj.endPoint || ''}`,
    method: requestObj.method || 'GET',
    headers: {
      'Authorization': indrzConfig.token,
      'Content-Type': 'application/json'
    }
  });
};

export default {
  request
}
