import { useState, useCallback } from 'react';

import { useSignalRConnection } from './useSignalRConnection';
import { makeResultState, noConnectionError } from './utils';

export const useLazySignalRInvoke = (method) => {
  const connection = useSignalRConnection();
  const [result, setResult] = useState({
    loading: false,
    data: null,
    error: null,
  });

  const invokeFn = useCallback(
    (...args) => {
      if (!connection) {
        return noConnectionError();
      }

      setResult(makeResultState({ loading: true }));
      const promise = connection.invoke(method, ...args);
      
      promise
        .then((data) => setResult(makeResultState({ data })))
        .catch((error) => setResult(makeResultState({ error })));

      return promise;
    },
    [connection, method],
  );

  return [invokeFn, result];
};
