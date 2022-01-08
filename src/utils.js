export const noop = () => void 0;

export const getNoConnectionError = () => new Error('SignalR connection object does not exist.');

export const promiseNoConnectionError = () =>
  Promise.reject(getNoConnectionError());

export const makeResultState = ({
  loading = false,
  data = null,
  error = null,
}) => ({
  loading,
  data,
  error,
});
