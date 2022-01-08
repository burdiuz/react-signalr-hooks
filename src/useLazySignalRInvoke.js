import { useState, useCallback } from "react";

import { useSignalRConnection } from "./useSignalRConnection";
import {
  makeResultState,
  promiseNoConnectionError,
  getNoConnectionError,
} from "./utils";

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
        setResult(makeResultState({ error: getNoConnectionError() }));
        return promiseNoConnectionError();
      }

      // keep result and error while loading new values
      setResult(makeResultState({ ...result, loading: true }));
      const promise = connection.invoke(method, ...args);

      promise
        .then((data) => setResult(makeResultState({ data })))
        .catch((error) => setResult(makeResultState({ error })));

      return promise;
    },
    [connection, result, method]
  );

  return [invokeFn, result];
};
