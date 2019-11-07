const signIn = (userInfo) => {
  return {
    data: {
      userName: userInfo.username,
      token: 'dummy-token'
    }
  };
};

export default {
  signIn
};
