import axios from 'axios';
import indrzConfig from '~/util/indrzConfig';

const getAuthorizationHeader = (env) => {
  const header = {
    'Content-Type': 'application/json'
  };
  if (env && env.token) {
    header.Authorization = env.token;
  }
  return header;
};

const request = function (requestObj, env) {
  return axios({
    url: `${requestObj.url || env.baseApiUrl}${requestObj.endPoint || ''}`,
    method: requestObj.method || 'GET',
    headers: {
      'Authorization': env.token,
      'Content-Type': 'application/json'
    }
  });
};

const postRequest = async function (requestObj, env) {
  try {
    const formData = new FormData();
    // eslint-disable-next-line no-unused-vars
    for (const [key, value] of Object.entries(requestObj.data)) {
      formData.append(key, value);
    }
    return await axios({
      url: `${requestObj.url || env.baseApiUrl}${requestObj.endPoint || ''}`,
      method: requestObj.method || 'POST',
      headers: getAuthorizationHeader(env),
      data: formData
    });
  } catch (err) {
    return err;
  }
};

const putRequest = async function (requestObj, env) {
  try {
    return await axios({
      url: `${requestObj.url || env.baseApiUrl}${requestObj.endPoint || ''}`,
      method: requestObj.method || 'PUT',
      headers: getAuthorizationHeader(env),
      data: requestObj.data
    });
  } catch (err) {
    return err;
  }
};

const getPageParams = ({ page = 1, itemsPerPage = 10 }) => {
  return {
    // page,
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage
  };
};

export default {
  request,
  postRequest,
  putRequest,
  getPageParams
};
