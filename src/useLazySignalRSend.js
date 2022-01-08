import { useCallback, useState } from "react";

import { useSignalRConnection } from "./useSignalRConnection";
import {
  makeResultState,
  promiseNoConnectionError,
  getNoConnectionError,
} from "./utils";

export const useLazySignalRSend = (method) => {
  const connection = useSignalRConnection();
  const [result, setResult] = useState({
    loading: false,
    data: null,
    error: null,
  });

  const sendFn = useCallback(
    (...args) => {
      if (!connection) {
        setResult(makeResultState({ error: getNoConnectionError() }));
        return promiseNoConnectionError();
      }

      // keep result and error while loading new values
      setResult(makeResultState({ ...result, loading: true }));
      const promise = connection.send(method, ...args);

      promise
        .then(() => setResult(makeResultState({})))
        .catch((error) => setResult(makeResultState({ error })));

      return promise;
    },
    [connection, result, method]
  );

  return [sendFn, result];
};
