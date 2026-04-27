/**
 * BeeApi
 *
 * Creates an Axios client with a configurable base URL.
 * Adds request/response interceptors and common headers.
 * Normalises API responses and error objects.
 * Returns cancelable request wrappers for get, post, put, delete, and download.
 *
 * Usage:
 *   import { createBeeApi } from './BeeApi';
 *   const api = createBeeApi({ baseURL: process.env.REACT_APP_BEE_API_URL });
 *   const { promise, cancel } = api.get('/endpoint');
 */

import axios from 'axios';
import makeCancelable from './CancelablePromise';

const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Normalises a successful Axios response into a plain data object.
 *
 * @param {import('axios').AxiosResponse} response
 * @returns {*}
 */
function normalizeResponse(response) {
  return response.data;
}

/**
 * Normalises an Axios error into a consistent shape.
 *
 * @param {import('axios').AxiosError} error
 * @returns {never}
 */
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

/**
 * Creates an Axios instance with interceptors wired up.
 *
 * @param {{ baseURL: string, headers?: Record<string, string> }} config
 * @returns {import('axios').AxiosInstance}
 */
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

  // Request interceptor – attach auth token if present
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

  // Response interceptor – normalise shape
  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );

  return instance;
}

/**
 * Wraps an Axios request promise in a cancelable wrapper and normalises the
 * result / error before surfacing them to the caller.
 *
 * @param {Promise} requestPromise
 * @returns {{ promise: Promise<*>, cancel: () => void }}
 */
function wrapRequest(requestPromise) {
  const normalized = requestPromise.then(normalizeResponse).catch(normalizeError);
  return makeCancelable(normalized);
}

/**
 * Factory that returns a thin API client bound to the given base URL.
 *
 * @param {{ baseURL: string, headers?: Record<string, string> }} config
 * @returns {{
 *   get: (url: string, params?: object) => { promise: Promise<*>, cancel: () => void },
 *   post: (url: string, data?: object) => { promise: Promise<*>, cancel: () => void },
 *   put: (url: string, data?: object) => { promise: Promise<*>, cancel: () => void },
 *   delete: (url: string) => { promise: Promise<*>, cancel: () => void },
 *   download: (url: string, params?: object) => { promise: Promise<Blob>, cancel: () => void },
 * }}
 */
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
