import React, { useEffect } from "react";
import { cleanup, act, render, waitFor } from "@testing-library/react";
import { useLazySignalRInvoke } from "../useLazySignalRInvoke";
import {
  useIsSignalRConnected,
  useSignalRConnection,
} from "../useSignalRConnection";

jest.mock("../useSignalRConnection", () => ({
  useSignalRConnection: jest.fn(),
  useIsSignalRConnected: jest.fn(),
}));

const Invoke = ({ method, args, allowInvoke = false }) => {
  const [invoke, { loading, data, error }] = useLazySignalRInvoke(method);

  useEffect(() => {
    if (allowInvoke) {
      invoke(...args).catch(() => null);
    }
  }, [allowInvoke]);

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

describe("useLazySignalRInvoke()", () => {
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

  it("should not call connection.invoke() method", () => {
    expect(mockConnection.invoke).not.toHaveBeenCalled();
  });

  it("should not render loading state before called", () => {
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

  describe("When invoking initiated", () => {
    beforeEach(() => {
      root.rerender(<Invoke method={method} args={args} allowInvoke={true} />);
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

      it("should render loaded data", () => {
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

      describe("When called to load again", () => {
        beforeEach(() => {
          createNewPromise();
          act(() => {
            root.rerender(
              <Invoke method={method} args={args} allowInvoke={false} />
            );
          });

          act(() => {
            root.rerender(
              <Invoke method={method} args={args} allowInvoke={true} />
            );
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

          it("should display loaded data", () => {
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

      describe("When method arguments changed", () => {
        beforeEach(() => {
          createNewPromise();

          args = [5, 6, 7];

          act(() => {
            root.rerender(
              <Invoke method={method} args={args} allowInvoke={false} />
            );
          });
        });

        it("should not call connection.invoke() until forced", () => {
          expect(mockConnection.invoke).toHaveBeenCalledTimes(1);
        });

        it("should render not loading state with previously loaded data", () => {
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

        describe("When invoking initiated", () => {
          beforeEach(() => {
            root.rerender(
              <Invoke method={method} args={args} allowInvoke={true} />
            );
          });

          it("should call connection.invoke() method", () => {
            expect(mockConnection.invoke).toHaveBeenCalledTimes(2);
            expect(mockConnection.invoke).toHaveBeenCalledWith(method, ...args);
          });

          it("should render loading state with previous data", () => {
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

            it("should display not loading with new data", () => {
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

    describe("When invoking failed", () => {
      beforeEach(async () => {
        act(() => {
          reject(new Error("Invokeing error!"));
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
    Error: Invokeing error!
  </div>
</div>
`);
      });

      describe("When called to invoke again", () => {
        beforeEach(() => {
          createNewPromise();
          act(() => {
            root.rerender(<Invoke method={method} args={args} />);
          });

          act(() => {
            root.rerender(
              <Invoke method={method} args={args} allowInvoke={true} />
            );
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
    Error: Invokeing error!
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

          it("should display not loading with loaded data", () => {
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
});

describe("useLazySignalRInvoke()", () => {
  let method;
  let args;
  let root = null;

  afterEach(() => {
    cleanup();
    root = null;
  });

  describe("When connection is null", () => {
    beforeEach(() => {
      useSignalRConnection.mockImplementation(() => null);
      useIsSignalRConnected.mockImplementation(() => false);
    });

    beforeEach(() => {
      method = "myMethod";
      args = [1, 2, 4];

      act(() => {
        root = render(<Invoke method={method} args={args} allowInvoke={true} />);
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
});
