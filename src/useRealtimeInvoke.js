import { useState, useEffect } from 'react';

import {
  useRealtimeConnection,
  useIsRealtimeConnected,
} from './useRealtimeConnection';
import { makeResultState, noConnectionError } from './utils';

export const useRealtimeInvoke = (method, methodArgs = []) => {
  const connection = useRealtimeConnection();
  const connected = useIsRealtimeConnected();
  const [result, setResult] = useState({
    loading: false,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!connected) {
      return;
    }

    if (!connection) {
      return noConnectionError();
    }

    setResult(makeResultState({ loading: true }));
    const promise = connection.invoke(method, ...methodArgs);

    promise
      .then((data) => setResult(makeResultState({ data })))
      .catch((error) => setResult(makeResultState({ error })));

    return promise;
  }, [connected, connection, ...methodArgs]);

  return result;
};
