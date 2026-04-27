import axios from 'axios';
import makeCancelable from './CancelablePromise';

const DEFAULT_TIMEOUT_MS = 30000;

function normalizeResponse(response) {
  return response.data;
}

function normalizeError(error) {
  if (error.response) {
    const { status, data } = error.response;
    const normalized = new Error(
      (data && (data.message || data.error)) || `Request failed with status ${status}`
    );
    normalized.status = status;
    normalized.data = data;
    throw normalized;
  }
  throw error;
}

function createAxiosInstance(config = {}) {
  const instance = axios.create({
    baseURL: config.baseURL || '',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(config.headers || {}),
    },
    timeout: DEFAULT_TIMEOUT_MS,
  });

  instance.interceptors.request.use(
    (axiosConfig) => {
      const token = typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem('authToken')
        : null;
      if (token) {
        axiosConfig.headers.Authorization = `Bearer ${token}`;
      }
      return axiosConfig;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );

  return instance;
}

function wrapRequest(requestPromise) {
  const normalized = requestPromise.then(normalizeResponse).catch(normalizeError);
  return makeCancelable(normalized);
}

function createBeeApi(config = {}) {
  const client = createAxiosInstance(config);

  return {
    get(url, params) {
      return wrapRequest(client.get(url, { params }));
    },

    post(url, data) {
      return wrapRequest(client.post(url, data));
    },

    put(url, data) {
      return wrapRequest(client.put(url, data));
    },

    delete(url) {
      return wrapRequest(client.delete(url));
    },

    download(url, params) {
      const requestPromise = client
        .get(url, { params, responseType: 'blob' })
        .then((res) => res.data);
      return makeCancelable(requestPromise);
    },
  };
}

export { createBeeApi, createAxiosInstance, wrapRequest };
export default createBeeApi;
