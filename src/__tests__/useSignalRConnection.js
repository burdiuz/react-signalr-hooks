import React from "react";
import { render, cleanup, act, waitFor } from "@testing-library/react";
import {
  HubConnectionState,
  mockHubConnection,
  resetSignalRMocks,
} from "@microsoft/signalr";
import { provideConnected } from "../testUtils";
import { SignalRProvider } from "../SignalRProvider";
import {
  useIsSignalRConnected,
  useSignalRConnection,
  useSignalRConnectionState,
} from "../useSignalRConnection";

jest.mock("@microsoft/signalr");

const Connection = () => {
  const connection = useSignalRConnection();

  return <div>Has Connection: {String(!!connection)}</div>;
};

const IsConnected = () => {
  const connected = useIsSignalRConnected();

  return <div>Is Connected: {String(connected)}</div>;
};

const ConnectionState = () => {
  const state = useSignalRConnectionState();

  return <div>Connection State: {String(state)}</div>;
};

describe("useSignalRConnection()", () => {
  let root = null;

  afterEach(() => {
    cleanup();
    resetSignalRMocks();
    root = null;
  });
  beforeEach(async () => {
    mockHubConnection.start.mockImplementation(() => Promise.resolve());

    root = await provideConnected(<Connection />)();
  });

  it("should render True", () => {
    expect(root.container).toMatchInlineSnapshot(`
<div>
  <div>
    Has Connection: 
    true
  </div>
</div>
`);
  });
});

describe("useIsSignalRConnected()", () => {
  let onError;
  let root = null;
  let resolve;
  let reject;
  let promise;

  const createNewPromise = () => {
    onError = jest.fn();
    promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
  };

  afterEach(() => {
    cleanup();
    resetSignalRMocks();
    root = null;
  });

  beforeEach(() => {
    createNewPromise();
  });

  describe("When connecting", () => {
    beforeEach(async () => {
      mockHubConnection.start.mockImplementation(() => promise);

      act(() => {
        root = render(
          <SignalRProvider
            onError={onError}
            connectionUrl="http://localhost:8000"
          >
            <IsConnected />
          </SignalRProvider>
        );
      });
    });

    it("should render False", () => {
      expect(root.container).toMatchInlineSnapshot(`
<div>
  <div>
    Is Connected: 
    false
  </div>
</div>
`);
    });

    describe("When connection succeeded", () => {
      beforeEach(() => {
        resolve();
        waitFor(() => promise);
      });

      it("should render True", () => {
        expect(root.container).toMatchInlineSnapshot(`
<div>
  <div>
    Is Connected: 
    false
  </div>
</div>
`);
      });
    });

    describe("When connection failed", () => {
      beforeEach(() => {
        reject(new Error("Connection failed!"));
        waitFor(() => promise.catch(() => null));
      });

      it("should render False", () => {
        expect(root.container).toMatchInlineSnapshot(`
<div>
  <div>
    Is Connected: 
    false
  </div>
</div>
`);
      });
    });
  });
});

describe("useSignalRConnectionState()", () => {
  let root = null;

  afterEach(() => {
    cleanup();
    resetSignalRMocks();
    root = null;
  });

  beforeEach(async () => {
    mockHubConnection.start.mockImplementation(() => Promise.resolve());

    mockHubConnection.state = HubConnectionState.Connecting;

    root = await provideConnected(<ConnectionState />)();
  });

  it("should render Connecting state", () => {
    expect(root.container).toMatchInlineSnapshot(`
<div>
  <div>
    Connection State: 
    Connecting
  </div>
</div>
`);
  });

  describe("When state changed", () => {
    beforeEach(async () => {
      mockHubConnection.state = HubConnectionState.Disconnected;

      root = await provideConnected(<ConnectionState />)();
    });

    it("should render Disconnected state", () => {
      expect(root.container).toMatchInlineSnapshot(`
<div>
  <div>
    Connection State: 
    Disconnected
  </div>
</div>
`);
    });
  });
});
