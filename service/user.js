import Api from '../util/api';

const signIn = (userInfo) => {
  return Api.postRequest({
    endPoint: 'api-token-auth/',
    data: userInfo
  });
  /*
  return {
    data: {
      userName: userInfo.username,
      token: 'dummy-token'
    }
  };
  */
};

export default {
  signIn
};
