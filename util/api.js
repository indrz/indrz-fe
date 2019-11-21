import axios from 'axios';
import indrzConfig from '~/util/indrzConfig'

const baseApiUrl = indrzConfig.baseApiUrl;

const getAuthorizationHeader = () => {
  const token = indrzConfig.token;
  const header = {
    'Content-Type': 'application/json'
  };
  if (token) {
    header.Authorization = token;
  }
  return header;
};

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

const postRequest = async function (requestObj) {
  try {
    const formData = new FormData();
    // eslint-disable-next-line no-unused-vars
    for (const [key, value] of Object.entries(requestObj.data)) {
      formData.append(key, value);
    }
    return await axios({
      url: `${requestObj.url || baseApiUrl}${requestObj.endPoint || ''}`,
      method: requestObj.method || 'POST',
      headers: getAuthorizationHeader(),
      data: formData
    })
  } catch (err) {
    return err;
  }
};

const getPageParams = ({ page = 1, itemsPerPage = 10 }) => {
  return {
    // page,
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage
  }
};

export default {
  request,
  postRequest,
  getPageParams
}
