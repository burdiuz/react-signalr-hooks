import React from "react";
import { cleanup, act, render, waitFor } from "@testing-library/react";
import { useSignalRSend } from "../useSignalRSend";
import {
  useIsSignalRConnected,
  useSignalRConnection,
} from "../useSignalRConnection";

jest.mock("../useSignalRConnection", () => ({
  useSignalRConnection: jest.fn(),
  useIsSignalRConnected: jest.fn(),
}));

const Send = ({ method, args }) => {
  const { loading, data, error } = useSignalRSend(method, args);

  return (
    <>
      {loading ? (
        <div data-testid="loading" />
      ) : (
        <div data-testid="no-loading" />
      )}
      {data ? <div data-testid="data" /> : <div data-testid="no-data" />}
      {error ? (
        <div data-testid="error">{String(error)}</div>
      ) : (
        <div data-testid="no-error" />
      )}
    </>
  );
};

describe("useSignalRSend()", () => {
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
      send: jest.fn(() => promise),
    };

    useSignalRConnection.mockImplementation(() => mockConnection);
    useIsSignalRConnected.mockImplementation(() => true);
  });

  beforeEach(() => {
    method = "myMethod";
    args = [1, 2, 4];

    act(() => {
      root = render(<Send method={method} args={args} />);
    });
  });

  it("should call connection.send() method", () => {
    expect(mockConnection.send).toHaveBeenCalledTimes(1);
    expect(mockConnection.send).toHaveBeenCalledWith(method, ...args);
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

  describe("When sending succeeded", () => {
    beforeEach(async () => {
      act(() => {
        resolve("Some promise value");
      });

      await waitFor(() => root.getByTestId("no-loading"));
    });

    it("should render no data, we do not care what send returns", () => {
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

    describe("When method arguments changed", () => {
      beforeEach(() => {
        createNewPromise();

        args = [5, 6, 7];

        act(() => {
          root.rerender(<Send method={method} args={args} />);
        });
      });

      it("should call connection.send() method", () => {
        expect(mockConnection.send).toHaveBeenCalledTimes(2);
        expect(mockConnection.send).toHaveBeenCalledWith(method, ...args);
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

      describe("When sending succeeded", () => {
        beforeEach(async () => {
          act(() => {
            resolve("Another promise value");
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

    describe("When method name changes", () => {
      beforeEach(() => {
        createNewPromise();

        method = "anotherMethod";

        act(() => {
          root.rerender(<Send method={method} args={args} />);
        });
      });

      it("should call connection.send() method", () => {
        expect(mockConnection.send).toHaveBeenCalledTimes(2);
        expect(mockConnection.send).toHaveBeenCalledWith(method, ...args);
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

      describe("When sending succeeded", () => {
        beforeEach(async () => {
          act(() => {
            resolve("Another promise value");
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
  });

  describe("When sending failed", () => {
    beforeEach(async () => {
      act(() => {
        reject(new Error("Sending error!"));
      });

      await waitFor(() => root.getByTestId("error"));
    });

    it("should render sending error", () => {
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
          root.rerender(<Send method={method} args={args} />);
        });
      });

      it("should call connection.send() method", () => {
        expect(mockConnection.send).toHaveBeenCalledTimes(2);
        expect(mockConnection.send).toHaveBeenCalledWith(method, ...args);
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

      describe("When sending succeeded", () => {
        beforeEach(async () => {
          act(() => {
            resolve("Another promise value");
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
  });
});

describe("useSignalRSend()", () => {
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
        root = render(<Send method={method} args={args} />);
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
        send: jest.fn(() => Promise.resolve()),
      };
  
      useSignalRConnection.mockImplementation(() => mockConnection);
    });
  
    beforeEach(() => {
      method = "myMethod";
      args = [1, 2, 4];
  
      act(() => {
        root = render(<Send method={method} args={args} />);
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
