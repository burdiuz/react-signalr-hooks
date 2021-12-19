import { useEffect, useState } from 'react';

import {
  useRealtimeConnection,
  useIsRealtimeConnected,
} from './useRealtimeConnection';
import { makeResultState, noConnectionError } from './utils';

export const useRealtimeSend = (method, methodArgs = []) => {
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

    if(!connection) {
      return noConnectionError();
    }

    setResult(makeResultState({ loading: true }));
    const promise = connection.send(method, ...methodArgs);

    promise
      .then(() => setResult(makeResultState({})))
      .catch((error) => setResult(makeResultState({ error })));

    return promise;
  }, [connected, connection, ...methodArgs]);

  return result;
};
