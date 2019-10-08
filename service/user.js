import Api from '../util/api';

const signIn = (userInfo) => {
  return Api.postRequest({
    endPoint: 'api-token-auth/',
    data: userInfo
  });
};

export default {
  signIn
};
