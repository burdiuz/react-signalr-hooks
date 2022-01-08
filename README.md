# @actualwave/use-signalr

React hooks for @microsoft/signalr library inspired by @apollo/client.

## Installation

```
npm add @actualwave/use-signalr
```

or

```
yarn add @actualwave/use-signalr
```

## API

- SignalRProvider - Provider component, should be the root node for every component using hooks from this package.

```javascript
<SignalRProvider
  onConnected={onConnected}
  onConnected={onError}
  connectionUrl="https://my.sonarr.domain"
>
  <App />
</SignalRProvider>
```

- useSignalRSend - Call `HubConnection.send()` every time hook arguments change.

```javascript
const MyComponent = () => {
  const [data, setData] = useState(null);
  const { loading, error } = useSignalRSend("mySignalRProcedure", [
    "argument 1",
    123,
  ]);

  useSignalRSubscribe("mySignalREvent", setData);

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    return <span className="danger">Unexpected error</span>;
  }

  return <div>{renderData(data)}</div>;
};
```

- useSignalRInvoke - Call `HubConnection.invoke()` every time hook arguments change.

```javascript
const MyComponent = () => {
  const { loading, data, error } = useSignalRSend("mySignalRProcedure", [
    "argument 1",
    123,
  ]);

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    return <span className="danger">Unexpected error</span>;
  }

  return <div>{renderData(data)}</div>;
};
```

- useLazySignalRSend - Returns send function with current hook state. Use function to call `HubConnection.send()`.

```javascript
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [mySignalRProcedure, { loading, error }] =
    useLazySignalRSend("mySignalRProcedure");

  useSignalRSubscribe("mySignalREvent", setData);

  useEffect(() => {
    mySignalRProcedure("argument 1", 123);
  }, []);

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    return <span className="danger">Unexpected error</span>;
  }

  return <div>{renderData(data)}</div>;
};
```

- useLazySignalRInvoke - Returns invoke function with current hook state. Use function to call `HubConnection.invoke()`.

```javascript
const MyComponent = () => {
  const [mySignalRProcedure, { loading, data, error }] =
    useLazySignalRInvoke("mySignalRProcedure");

  useEffect(() => {
    mySignalRProcedure("argument 1", 123);
  }, []);

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    return <span className="danger">Unexpected error</span>;
  }

  return <div>{renderData(data)}</div>;
};
```

- useSignalRSubscribe - Subscribes callback function to a HubConnection event. Returns unsubscribe function.

```javascript
const MyComponent = () => {
  const [data, setData] = useState(null);

  const unsubscribeFn = useSignalRSubscribe("mySignalREvent", setData);

  // unsubscribe when MyComponent is unmounted
  useEffect(() => unsubscribeFn(), []);

  return <div>{renderData(data)}</div>;
};
```

- useSignalRConnection - Returns HubConnection instance.

```javascript
const MyComponent = ({ procedure, argument }) => {
  const connection = useSignalRConnection();

  // unsubscribe when MyComponent is unmounted
  useEffect(() => {
    connection.send(procedure, argument);
  }, [procedure, argument]);

  return <div>{renderData(data)}</div>;
};
```

- useIsSignalRConnected - Returns boolean, true if HubConnection successfuly connected.

```javascript
const MyComponent = () => {
  const connected = useIsSignalRConnected();

  if (!connected) {
    return <span>Sorry, not connected...</span>;
  }

  return <MyRealtimeUI />;
};
```

#### Additionaly

- SignalRConsumer - Consumer accepts a render function as child and provides an tuple with connection and connected boolean value.

```javascript
<SignalRConsumer>
  {([connection, connected]) => {
    if (!connection || !connected) {
      return null;
    }

    return <MyRealtimeUI connection={connection} />;
  }}
</SignalRConsumer>
```

- useCloseBeforeUnload - Use to call `HubConnection.stop()` when `beforeunload` event fired.

```javascript
// use hook somewhere in provider tree
const MyComponent = () => {
  useCloseBeforeUnload();

  return <MyRealtimeUI />;
};

<SignalRProvider>
  <App>
    <MyComponent />
  </App>
</SignalRProvider>;
```

- useSignalRConnectionState - Returns `HubConnection.state`. This property is being murated and hook `useSignalRConnectionState()` does not trigger rerender of the component.

```javascript
const MyComponent = () => {
  // ATTENTION: Will not cause rerender when state changes!
  const state = useSignalRConnectionState();

  if (state !== HubConnectionState.Connected) {
    return <span>Sorry, not connected...</span>;
  }

  return <MyRealtimeUI />;
};
```
