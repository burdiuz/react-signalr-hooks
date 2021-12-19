import { useCallback, useState } from 'react';

import { useRealtimeConnection } from './useRealtimeConnection';
import { makeResultState, noConnectionError } from './utils';

export const useLazyRealtimeSend = (method) => {
  const connection = useRealtimeConnection();
  const [result, setResult] = useState({
    loading: false,
    data: null,
    error: null,
  });

  const sendFn = useCallback(
    (...args) => {
      if (!connection) {
        return noConnectionError();
      }

      setResult(makeResultState({ loading: true }));
      const promise = connection.send(method, ...args);

      promise
        .then(() => setResult(makeResultState({})))
        .catch((error) => setResult(makeResultState({ error })));

      return promise;
    },
    [connection, method],
  );

  return [sendFn, result];
};
