import axios from 'axios';
import indrzConfig from '~/util/indrzConfig'

const baseApiUrl = indrzConfig.baseApiUrl;

const request = async function (requestObj) {
  try {
    return await axios({
      url: `${requestObj.url || baseApiUrl}${requestObj.endPoint || ''}`,
      method: requestObj.method || 'GET',
      headers: {
        'Authorization': indrzConfig.token,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

export default {
  request
}
