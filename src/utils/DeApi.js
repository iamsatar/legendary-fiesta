/**
 * DeApi
 *
 * Variant of BeeApi targeting a different base URL (the "De" service endpoint).
 * Creates an Axios client with configurable base URL, request/response
 * interceptors, and common headers.
 * Returns cancelable request wrappers for get, post, put, delete, and download.
 *
 * Usage:
 *   import { createDeApi } from './DeApi';
 *   const api = createDeApi({ baseURL: process.env.REACT_APP_DE_API_URL });
 *   const { promise, cancel } = api.get('/endpoint');
 */

import { createBeeApi } from './BeeApi';

/**
 * Factory that returns a thin API client bound to the DE service base URL.
 * Accepts the same configuration as `createBeeApi`.
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
function createDeApi(config = {}) {
  const defaultConfig = {
    baseURL: process.env.REACT_APP_DE_API_URL || '',
    ...config,
  };
  return createBeeApi(defaultConfig);
}

export { createDeApi };
export default createDeApi;
