import { useState, useEffect } from 'react';

import { useRealtimeConnection } from './useRealtimeConnection';
import { noop } from './utils';

export const useRealtimeSubscribe = (method, subscribeFn) => {
  const connection = useRealtimeConnection();
  const [unsubscribeFn, setUnsubscribeFn] = useState(noop);

  useEffect(() => {
    unsubscribeFn && unsubscribeFn();
    setUnsubscribeFn(noop);

    if (!subscribeFn) {
      return;
    }

    connection?.on(method, subscribeFn);

    setUnsubscribeFn(() => () => {
      connection?.off(method, subscribeFn);
    });
  }, [connection, method, subscribeFn]);

  return unsubscribeFn;
};
