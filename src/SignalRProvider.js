import React, { memo, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

import { Provider } from "./context";

const defaultConfiguratorFn = (
  builder,
  { connectionUrl, logLevel = LogLevel.Warning }
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
    children,
    onClose,
    onError,
    onConnected,
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
      newConnection
        .start()
        .then(() => {
          if (onConnected) {
            onConnected(newConnection);
          }

          setConnected(true);
        })
        .catch((error) => {
          if (!onError) {
            return Promise.reject(error);
          }

          onError(error);
        });
    }

    setConnection(newConnection);
  }, [connectionUrl, configuratorFn]);

  return <Provider value={[connection, connected]}>{children}</Provider>;
};

export const SignalRProvider = memo(
  SignalRProviderComponent,
  (
    { connectionUrl, configuratorFn },
    { connectionUrl: prevConnectionUrl, configuratorFn: prevConfiguratorFn }
  ) =>
    ((!connectionUrl && !prevConnectionUrl) ||
      connectionUrl === prevConnectionUrl) &&
    configuratorFn === prevConfiguratorFn
);

SignalRProvider.propTypes = {
  connectionUrl: PropTypes.string.isRequired,
  logLevel: PropTypes.oneOf([
    LogLevel.Critical,
    LogLevel.Debug,
    LogLevel.Error,
    LogLevel.Information,
    LogLevel.None,
    LogLevel.Trace,
    LogLevel.Warning,
  ]),
  configuratorFn: PropTypes.func,
  children: PropTypes.node,
  onClose: PropTypes.func,
  onError: PropTypes.func,
  onConnected: PropTypes.func,
  onReconnecting: PropTypes.func,
  onReconnected: PropTypes.func,
};
