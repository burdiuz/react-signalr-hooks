import { useContext } from 'react';
import { HubConnectionState } from '@microsoft/signalr';

import { context } from './context';

export const useSignalRConnection = () => {
  const [connection] = useContext(context) || [];

  return connection;
};

export const useSignalRConnectionState = () => {
  const connection = useContext(context);

  return connection?.state || '';
};

export const useIsSignalRConnected = () => {
  const [connection, connected] = useContext(context) || [];

  return connected && !!(connection?.state === HubConnectionState.Connected);
};
