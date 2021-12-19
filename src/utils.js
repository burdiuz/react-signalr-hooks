export const noop = () => void 0;

export const verifyConnection = (connection) => {
  if (!connection) {
    throw new Error('Connection object does not exist.');
  }
};

export const noConnectionError = () =>
  Promise.reject(new Error('Connection object does not exist.'));

export const makeResultState = ({
  loading = false,
  data = null,
  error = null,
}) => ({
  loading,
  data,
  error,
});
