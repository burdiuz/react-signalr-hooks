export const noop = () => void 0;

export const noConnectionError = () =>
  Promise.reject(new Error('SignalR connection object does not exist.'));

export const makeResultState = ({
  loading = false,
  data = null,
  error = null,
}) => ({
  loading,
  data,
  error,
});
