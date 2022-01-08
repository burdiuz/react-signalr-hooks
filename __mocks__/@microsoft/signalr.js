export const mockHubConnection = {
  send: jest.fn(),
  invoke: jest.fn(),
  stream: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  onclose: jest.fn(),
  onreconnected: jest.fn(),
  onreconnecting: jest.fn(),
};

export const LogLevel = {
  Trace: 0,
  Debug: 1,
  Information: 2,
  Warning: 3,
  Error: 4,
  Critical: 5,
  None: 6,
};

export const HubConnectionState = {
  Disconnected: "Disconnected",
  Connecting: "Connecting",
  Connected: "Connected",
  Disconnecting: "Disconnecting",
  Reconnecting: "Reconnecting",
};

export const HubConnection = jest.fn(function () {
  return mockHubConnection;
});

HubConnection.create = jest.fn(() => mockHubConnection);

export const mockHubConnectionBuilder = {
  build: jest.fn(),
  withUrl: jest.fn(),
  withHubProtocol: jest.fn(),
  configureLogging: jest.fn(),
  withAutomaticReconnect: jest.fn(),
};

export const HubConnectionBuilder = jest.fn(function () {
  return mockHubConnectionBuilder;
});

export const resetSignalRMocks = () => {
  const connFn = (key) => () =>
    Promise.reject(new Error(`Not Implemented "${key}".`));
  const voids = ["on", "off", "onclose", "onreconnected", "onreconnecting"];

  Object.keys(mockHubConnection).forEach((key) => {
    const { [key]: fn } = mockHubConnection;

    if (!jest.isMockFunction(fn)) {
      return;
    }

    fn.mockReset();

    if (!voids.includes(key)) {
      fn.mockImplementation(connFn(key));
    }
  });

  const builderFn = () => mockHubConnectionBuilder;

  Object.keys(mockHubConnectionBuilder).forEach((key) => {
    const { [key]: fn } = mockHubConnectionBuilder;

    if (!jest.isMockFunction(fn)) {
      return;
    }

    fn.mockReset();
    fn.mockImplementation(builderFn);
  });

  // overwrite defualt mock with build() mock to return connection instead of builder
  mockHubConnectionBuilder.build.mockImplementation(() => mockHubConnection);
};

resetSignalRMocks();
