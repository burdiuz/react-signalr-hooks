import { useEffect, useState } from 'react';

import {
  useSignalRConnection,
  useIsSignalRConnected,
} from './useSignalRConnection';
import { makeResultState, noConnectionError } from './utils';

export const useSignalRSend = (method, methodArgs = []) => {
  const connection = useSignalRConnection();
  const connected = useIsSignalRConnected();
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
  }, [connected, connection, method, ...methodArgs]);

  return result;
};
