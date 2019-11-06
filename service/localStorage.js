const tokenName = 'indrz-frontend';

const setToken = (token) => {
  sessionStorage.setItem(tokenName, JSON.stringify(token));
};

const getTokenData = () => {
  const tokenData = sessionStorage.getItem(tokenName);
  if (tokenData) {
    return JSON.parse(tokenData);
  }
  return null;
};

const removeToken = () => {
  sessionStorage.clear();
};

export default {
  setToken,
  getTokenData,
  removeToken
};
