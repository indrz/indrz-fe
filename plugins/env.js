import api from '../util/api';

export default ({ app }) => {
  api.setEnv(app.$config);
}
