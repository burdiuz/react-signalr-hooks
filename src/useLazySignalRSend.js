import { useCallback, useState } from "react";

import { useSignalRConnection } from "./useSignalRConnection";
import {
  promiseNoConnectionError,
  getNoConnectionError,
} from "./utils";

export const useLazySignalRSend = (method) => {
  const connection = useSignalRConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendFn = useCallback(
    (...args) => {
      if (!connection) {
        setLoading(false);
        setError(getNoConnectionError());
        return promiseNoConnectionError();
      }

      // keep result and error while loading new values
      setLoading(true);
      const promise = connection.send(method, ...args);

      promise
        .then(() => {
          setLoading(false);
          setError(null);
        })
        .catch((error) => {
          setLoading(false);
          setError(error);
        });

      return promise;
    },
    [connection, method]
  );

  return [sendFn, { loading, error }];
};
