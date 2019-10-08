const tokenName = 'golf-gis';
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

const removeToekn = () => {
  sessionStorage.clear();
};

export default {
  setToken,
  getTokenData,
  removeToekn
};
