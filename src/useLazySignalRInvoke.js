import { useState, useCallback } from "react";

import { useSignalRConnection } from "./useSignalRConnection";
import {
  promiseNoConnectionError,
  getNoConnectionError,
} from "./utils";

export const useLazySignalRInvoke = (method) => {
  const connection = useSignalRConnection();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const invokeFn = useCallback(
    (...args) => {
      if (!connection) {
        setLoading(false);
        setData(null);
        setError(getNoConnectionError());
        return promiseNoConnectionError();
      }

      // keep result and error while loading new values
      setLoading(true);
      const promise = connection.invoke(method, ...args);

      promise
        .then((data) => {
          setLoading(false);
          setData(data);
          setError(null);
        })
        .catch((error) => {
          setLoading(false);
          setData(null);
          setError(error);
        });

      return promise;
    },
    [connection, method]
  );

  return [invokeFn, { loading, data, error }];
};
