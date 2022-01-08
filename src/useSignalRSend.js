import { useEffect, useState } from "react";

import {
  useSignalRConnection,
  useIsSignalRConnected,
} from "./useSignalRConnection";
import { makeResultState, getNoConnectionError } from "./utils";

export const useSignalRSend = (method, methodArgs = []) => {
  const connection = useSignalRConnection();
  const connected = useIsSignalRConnected();
  const [result, setResult] = useState({
    loading: false,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!connection) {
      setResult(makeResultState({ error: getNoConnectionError() }));
      return;
    }

    if (!connected) {
      return;
    }

    // keep result and error while loading new values
    setResult(makeResultState({ ...result, loading: true }));
    const promise = connection.send(method, ...methodArgs);

    promise
      .then(() => setResult(makeResultState({})))
      .catch((error) => setResult(makeResultState({ error })));
  }, [connected, connection, method, ...methodArgs]);

  return result;
};
