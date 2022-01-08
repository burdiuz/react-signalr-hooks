import { useState, useEffect } from 'react';

import { useSignalRConnection } from './useSignalRConnection';
import { noop } from './utils';

export const useSignalRSubscribe = (method, subscribeFn) => {
  const connection = useSignalRConnection();
  const [unsubscribeFn, setUnsubscribeFn] = useState(() => noop);

  useEffect(() => {
    unsubscribeFn && unsubscribeFn();

    if (!subscribeFn) {
      setUnsubscribeFn(() => noop);
      return;
    }

    connection?.on(method, subscribeFn);

    setUnsubscribeFn(() => () => {
      connection?.off(method, subscribeFn);
    });
  }, [connection, method, subscribeFn]);

  return unsubscribeFn;
};
