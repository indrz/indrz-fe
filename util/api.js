import axios from 'axios';
import config from './indrzConfig';

const { env } = config;

const getAuthorizationHeader = () => {
  const header = {
    'Content-Type': 'application/json'
  };
  if (env.TOKEN) {
    header.Authorization = env.TOKEN;
  }
  return header;
};

const request = function (requestObj) {
  return axios({
    url: `${requestObj.url || env.BASE_API_URL}${requestObj.endPoint || ''}`,
    method: requestObj.method || 'GET',
    headers: {
      Authorization: env.TOKEN,
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
      url: `${requestObj.url || env.BASE_API_URL}${requestObj.endPoint || ''}`,
      method: requestObj.method || 'POST',
      headers: getAuthorizationHeader(),
      data: formData
    })
  } catch (err) {
    return err;
  }
};

const putRequest = async function (requestObj) {
  try {
    return await axios({
      url: `${requestObj.url || env.BASE_API_URL}${requestObj.endPoint || ''}`,
      method: requestObj.method || 'PUT',
      headers: getAuthorizationHeader(),
      data: requestObj.data
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
  putRequest,
  getPageParams
}
