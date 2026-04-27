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
