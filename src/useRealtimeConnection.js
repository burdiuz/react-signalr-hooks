import { useContext } from 'react';
import { HubConnectionState } from '@microsoft/signalr';

import { context } from './context';

export const useRealtimeConnection = () => {
  const [connection] = useContext(context) || [];

  return connection;
};

export const useRealtimeConnectionState = () => {
  const connection = useContext(context);

  return connection?.state || '';
};

export const useIsRealtimeConnected = () => {
  const [connection, connected] = useContext(context) || [];

  return connected && !!(connection?.state === HubConnectionState.Connected);
};
