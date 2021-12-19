import React, { memo, useState, useEffect, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

import { Provider } from './context';

const defaultConfiguratorFn = (
  builder,
  { connectionUrl, logLevel = LogLevel.Warning },
) =>
  builder
    .withUrl(connectionUrl)
    .configureLogging(logLevel)
    .withAutomaticReconnect();

const SignalRProviderComponent = (props) => {
  const [connected, setConnected] = useState(false);
  const [connection, setConnection] = useState(null);
  const {
    connectionUrl,
    configuratorFn = defaultConfiguratorFn,
    disconnectBeforeUnload,
    children,
    onClose,
    onReconnecting,
    onReconnected,
  } = props;

  const handleClosed = useCallback(() => setConnected(false), []);

  useEffect(() => {
    connection?.onclose(onClose);
  }, [connection, onClose]);

  useEffect(() => {
    connection?.onreconnected(onReconnected);
  }, [connection, onReconnected]);

  useEffect(() => {
    connection?.onreconnecting(onReconnecting);
  }, [connection, onReconnecting]);

  useEffect(() => {
    if (connection) {
      connection.stop();
    }

    let newConnection = null;

    if (connectionUrl) {
      newConnection = configuratorFn(new HubConnectionBuilder(), props).build();
      newConnection.onclose(handleClosed);
      newConnection.start().then(() => setConnected(true));
    }

    setConnection(newConnection);
  }, [connectionUrl, configuratorFn]);

  useEffect(() => {
    if (!disconnectBeforeUnload) {
      return;
    }
  }, [connection, disconnectBeforeUnload]);

  return <Provider value={[connection, connected]}>{children}</Provider>;
};

export const SignalRProvider = memo(
  SignalRProviderComponent,
  (
    { connectionUrl, configuratorFn },
    { connectionUrl: prevConnectionUrl, configuratorFn: prevConfiguratorFn },
  ) =>
    ((!connectionUrl && !prevConnectionUrl) ||
      connectionUrl === prevConnectionUrl) &&
    configuratorFn === prevConfiguratorFn,
);
