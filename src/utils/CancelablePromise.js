/**
 * CancelablePromise
 *
 * Wraps any promise to support cancellation.
 * Prevents resolved/rejected handlers from running after cancellation.
 * Supports React component unmount patterns and generic async cleanup.
 *
 * @example
 * const cancelable = makeCancelable(fetch('/api/data'));
 *
 * cancelable.promise
 *   .then(result => console.log(result))
 *   .catch(err => {
 *     if (!err.isCanceled) console.error(err);
 *   });
 *
 * // On component unmount:
 * cancelable.cancel();
 */

/**
 * Wraps a promise so that its then/catch handlers can be suppressed by calling
 * the returned `cancel()` function.
 *
 * @template T
 * @param {Promise<T>} promise - The promise to wrap.
 * @returns {{ promise: Promise<T>, cancel: () => void }}
 */
function makeCancelable(promise) {
  let hasCanceled = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (value) => {
        if (hasCanceled) {
          reject({ isCanceled: true });
        } else {
          resolve(value);
        }
      },
      (error) => {
        if (hasCanceled) {
          reject({ isCanceled: true });
        } else {
          reject(error);
        }
      }
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true;
    },
  };
}

export { makeCancelable };
export default makeCancelable;
