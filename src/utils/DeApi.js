import { createBeeApi } from './BeeApi';

function createDeApi(config = {}) {
  const defaultConfig = {
    baseURL: process.env.REACT_APP_DE_API_URL || '',
    ...config,
  };
  return createBeeApi(defaultConfig);
}

export { createDeApi };
export default createDeApi;
