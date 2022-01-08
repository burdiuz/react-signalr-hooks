import React from "react";
import { cleanup, act, render, waitFor } from "@testing-library/react";
import { useSignalRInvoke } from "../useSignalRInvoke";
import {
  useIsSignalRConnected,
  useSignalRConnection,
} from "../useSignalRConnection";

jest.mock("../useSignalRConnection", () => ({
  useSignalRConnection: jest.fn(),
  useIsSignalRConnected: jest.fn(),
}));

const Invoke = ({ method, args }) => {
  const { loading, data, error } = useSignalRInvoke(method, args);

  return (
    <>
      {loading ? (
        <div data-testid="loading" />
      ) : (
        <div data-testid="no-loading" />
      )}
      {data ? (
        <div data-testid="data">{JSON.stringify(data)}</div>
      ) : (
        <div data-testid="no-data" />
      )}
      {error ? (
        <div data-testid="error">{String(error)}</div>
      ) : (
        <div data-testid="no-error" />
      )}
    </>
  );
};

describe("useSignalRInvoke()", () => {
  let mockConnection;
  let method;
  let args;
  let promise;
  let resolve;
  let reject;
  let root = null;

  const createNewPromise = () => {
    promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
  };

  afterEach(() => {
    cleanup();
    root = null;
  });

  beforeEach(() => {
    createNewPromise();

    mockConnection = {
      invoke: jest.fn(() => promise),
    };

    useSignalRConnection.mockImplementation(() => mockConnection);
    useIsSignalRConnected.mockImplementation(() => true);
  });

  beforeEach(() => {
    method = "myMethod";
    args = [1, 2, 4];

    act(() => {
      root = render(<Invoke method={method} args={args} />);
    });
  });

  it("should call connection.invoke() method", () => {
    expect(mockConnection.invoke).toHaveBeenCalledTimes(1);
    expect(mockConnection.invoke).toHaveBeenCalledWith(method, ...args);
  });

  it("should render loading state", () => {
    expect(root.container).toMatchInlineSnapshot(`
<div>
  <div
    data-testid="loading"
  />
  <div
    data-testid="no-data"
  />
  <div
    data-testid="no-error"
  />
</div>
`);
  });

  describe("When invoking succeeded", () => {
    beforeEach(async () => {
      act(() => {
        resolve({ value: "Some promise value" });
      });

      await waitFor(() => root.getByTestId("no-loading"));
    });

    it("should render not loading with data", () => {
      expect(root.container).toMatchInlineSnapshot(`
<div>
  <div
    data-testid="no-loading"
  />
  <div
    data-testid="data"
  >
    {"value":"Some promise value"}
  </div>
  <div
    data-testid="no-error"
  />
</div>
`);
    });

    describe("When method arguments changed", () => {
      beforeEach(() => {
        createNewPromise();

        args = [5, 6, 7];

        act(() => {
          root.rerender(<Invoke method={method} args={args} />);
        });
      });

      it("should call connection.invoke() method", () => {
        expect(mockConnection.invoke).toHaveBeenCalledTimes(2);
        expect(mockConnection.invoke).toHaveBeenCalledWith(method, ...args);
      });

      it("should render loading state", () => {
        expect(root.container).toMatchInlineSnapshot(`
<div>
  <div
    data-testid="loading"
  />
  <div
    data-testid="data"
  >
    {"value":"Some promise value"}
  </div>
  <div
    data-testid="no-error"
  />
</div>
`);
      });

      describe("When invoking succeeded", () => {
        beforeEach(async () => {
          act(() => {
            resolve({ value: "Another promise value" });
          });

          await waitFor(() => root.getByTestId("no-loading"));
        });

        it("should display not loading and no data", () => {
          expect(root.container).toMatchInlineSnapshot(`
<div>
  <div
    data-testid="no-loading"
  />
  <div
    data-testid="data"
  >
    {"value":"Another promise value"}
  </div>
  <div
    data-testid="no-error"
  />
</div>
`);
        });
      });
    });

    describe("When method name changes", () => {
      beforeEach(() => {
        createNewPromise();

        method = "anotherMethod";

        act(() => {
          root.rerender(<Invoke method={method} args={args} />);
        });
      });

      it("should call connection.invoke() method", () => {
        expect(mockConnection.invoke).toHaveBeenCalledTimes(2);
        expect(mockConnection.invoke).toHaveBeenCalledWith(method, ...args);
      });

      it("should render loading state", () => {
        expect(root.container).toMatchInlineSnapshot(`
<div>
  <div
    data-testid="loading"
  />
  <div
    data-testid="data"
  >
    {"value":"Some promise value"}
  </div>
  <div
    data-testid="no-error"
  />
</div>
`);
      });

      describe("When invoking succeeded", () => {
        beforeEach(async () => {
          act(() => {
            resolve({ value: "Another promise value" });
          });

          await waitFor(() => root.getByTestId("no-loading"));
        });

        it("should display not loading and no data", () => {
          expect(root.container).toMatchInlineSnapshot(`
<div>
  <div
    data-testid="no-loading"
  />
  <div
    data-testid="data"
  >
    {"value":"Another promise value"}
  </div>
  <div
    data-testid="no-error"
  />
</div>
`);
        });
      });
    });
  });

  describe("When invoking failed", () => {
    beforeEach(async () => {
      act(() => {
        reject(new Error("Sending error!"));
      });

      await waitFor(() => root.getByTestId("error"));
    });

    it("should render invoking error", () => {
      expect(root.container).toMatchInlineSnapshot(`
<div>
  <div
    data-testid="no-loading"
  />
  <div
    data-testid="no-data"
  />
  <div
    data-testid="error"
  >
    Error: Sending error!
  </div>
</div>
`);
    });

    describe("When method arguments changed", () => {
      beforeEach(() => {
        createNewPromise();

        args = [5, 6, 7];

        act(() => {
          root.rerender(<Invoke method={method} args={args} />);
        });
      });

      it("should call connection.invoke() method", () => {
        expect(mockConnection.invoke).toHaveBeenCalledTimes(2);
        expect(mockConnection.invoke).toHaveBeenCalledWith(method, ...args);
      });

      it("should render loading state", () => {
        expect(root.container).toMatchInlineSnapshot(`
<div>
  <div
    data-testid="loading"
  />
  <div
    data-testid="no-data"
  />
  <div
    data-testid="error"
  >
    Error: Sending error!
  </div>
</div>
`);
      });

      describe("When invoking succeeded", () => {
        beforeEach(async () => {
          act(() => {
            resolve({ value: "Another promise value" });
          });

          await waitFor(() => root.getByTestId("no-loading"));
        });

        it("should display not loading and no data", () => {
          expect(root.container).toMatchInlineSnapshot(`
<div>
  <div
    data-testid="no-loading"
  />
  <div
    data-testid="data"
  >
    {"value":"Another promise value"}
  </div>
  <div
    data-testid="no-error"
  />
</div>
`);
        });
      });
    });
  });
});

describe("useSignalRInvoke()", () => {
  let method;
  let args;
  let root = null;

  afterEach(() => {
    cleanup();
    root = null;
  });
  
  beforeEach(() => {
    useSignalRConnection.mockImplementation(() => null);
    useIsSignalRConnected.mockImplementation(() => false);
  });
  
  describe("When connection is null", () => {
    beforeEach(() => {
      method = "myMethod";
      args = [1, 2, 4];
  
      act(() => {
        root = render(<Invoke method={method} args={args} />);
      });
    });
  
    it("should render error state", () => {
      expect(root.container).toMatchInlineSnapshot(`
<div>
  <div
    data-testid="no-loading"
  />
  <div
    data-testid="no-data"
  />
  <div
    data-testid="error"
  >
    Error: SignalR connection object does not exist.
  </div>
</div>
`);
    });
  });

  describe("When is not connected", () => {
    let mockConnection;

    beforeEach(() => {
      mockConnection = {
        invoke: jest.fn(() => Promise.resolve()),
      };
  
      useSignalRConnection.mockImplementation(() => mockConnection);
    });
  
    beforeEach(() => {
      method = "myMethod";
      args = [1, 2, 4];
  
      act(() => {
        root = render(<Invoke method={method} args={args} />);
      });
    });
  
    it("should render not loading state", () => {
      expect(root.container).toMatchInlineSnapshot(`
<div>
  <div
    data-testid="no-loading"
  />
  <div
    data-testid="no-data"
  />
  <div
    data-testid="no-error"
  />
</div>
`);
    });
  });
});
