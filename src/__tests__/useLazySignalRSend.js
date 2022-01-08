import React, { useEffect } from "react";
import { cleanup, act, render, waitFor } from "@testing-library/react";
import { useLazySignalRSend } from "../useLazySignalRSend";
import {
  useIsSignalRConnected,
  useSignalRConnection,
} from "../useSignalRConnection";

jest.mock("../useSignalRConnection", () => ({
  useSignalRConnection: jest.fn(),
  useIsSignalRConnected: jest.fn(),
}));

const Send = ({ method, args, allowSend = false }) => {
  const [send, { loading, data, error }] = useLazySignalRSend(method);

  useEffect(() => {
    if (allowSend) {
      send(...args).catch(() => null);
    }
  }, [allowSend]);

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

describe("useLazySignalRSend()", () => {
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

  it("should not call connection.send() method", () => {
    expect(mockConnection.send).not.toHaveBeenCalled();
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

  describe("When sending initiated", () => {
    beforeEach(() => {
      root.rerender(<Send method={method} args={args} allowSend={true} />);
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

      describe("When called to load again", () => {
        beforeEach(() => {
          createNewPromise();
          act(() => {
            root.rerender(
              <Send method={method} args={args} allowSend={false} />
            );
          });

          act(() => {
            root.rerender(
              <Send method={method} args={args} allowSend={true} />
            );
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

      describe("When method arguments changed", () => {
        beforeEach(() => {
          createNewPromise();

          args = [5, 6, 7];

          act(() => {
            root.rerender(
              <Send method={method} args={args} allowSend={false} />
            );
          });
        });

        it("should not call connection.send() until forced", () => {
          expect(mockConnection.send).toHaveBeenCalledTimes(1);
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

        describe("When sending initiated", () => {
          beforeEach(() => {
            root.rerender(
              <Send method={method} args={args} allowSend={true} />
            );
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

      describe("When called to send again", () => {
        beforeEach(() => {
          createNewPromise();
          act(() => {
            root.rerender(<Send method={method} args={args} />);
          });

          act(() => {
            root.rerender(
              <Send method={method} args={args} allowSend={true} />
            );
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
});

describe("useLazySignalRSend()", () => {
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
        root = render(<Send method={method} args={args} allowSend={true} />);
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
