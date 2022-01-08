import React from "react";
import { act, render, cleanup, waitFor } from "@testing-library/react";
import { SignalRProvider } from "../SignalRProvider";
import {
  mockHubConnection,
  mockHubConnectionBuilder,
  resetSignalRMocks,
  LogLevel,
} from "@microsoft/signalr";

jest.mock("@microsoft/signalr");

describe("SignalRProvider", () => {
  let root = null;

  afterEach(() => {
    cleanup();
    resetSignalRMocks();
    root = null;
  });

  describe("When connection successful", () => {
    let onConnected;

    beforeEach(() => {
      onConnected = jest.fn();
      mockHubConnection.start.mockImplementation(() => Promise.resolve());
      mockHubConnection.stop.mockImplementation(() => Promise.resolve());
    });

    describe("When default configurator used", () => {
      beforeEach(async () => {
        act(() => {
          root = render(
            <SignalRProvider
              onConnected={onConnected}
              connectionUrl="http://localhost:8000"
            >
              <div>My DOM Tree.</div>
              <span>Label</span>
              <button>Click Me</button>
            </SignalRProvider>
          );
        });

        await waitFor(() => expect(onConnected).toHaveBeenCalledTimes(1));
      });

      it("should create connection", () => {
        expect(mockHubConnectionBuilder.build).toHaveBeenCalledTimes(1);
        expect(mockHubConnection.start).toHaveBeenCalledTimes(1);
      });

      it("should apply default configurator", () => {
        expect(mockHubConnectionBuilder.withUrl).toHaveBeenCalledTimes(1);
        expect(mockHubConnectionBuilder.withUrl).toHaveBeenCalledWith(
          "http://localhost:8000"
        );

        expect(mockHubConnectionBuilder.configureLogging).toHaveBeenCalledTimes(
          1
        );
        expect(mockHubConnectionBuilder.configureLogging).toHaveBeenCalledWith(
          LogLevel.Warning
        );

        expect(
          mockHubConnectionBuilder.withAutomaticReconnect
        ).toHaveBeenCalledTimes(1);
      });

      it("should render all child nodes", () => {
        expect(root.container).toMatchInlineSnapshot(`
<div>
  <div>
    My DOM Tree.
  </div>
  <span>
    Label
  </span>
  <button>
    Click Me
  </button>
</div>
`);
      });

      describe("When connection URL changed", () => {
        beforeEach(async () => {
          act(() => {
            root.rerender(
              <SignalRProvider
                onConnected={onConnected}
                connectionUrl="http://somewhere:8081"
                logLevel={LogLevel.Critical}
              >
                <div>My DOM Tree.</div>
                <span>Label</span>
                <button>Click Me</button>
              </SignalRProvider>
            );
          });

          await waitFor(() => expect(onConnected).toHaveBeenCalledTimes(2));
        });

        it("should stop previous connection", () => {
          expect(mockHubConnection.stop).toHaveBeenCalledTimes(1);
        });

        it("should create new connection", () => {
          expect(mockHubConnectionBuilder.build).toHaveBeenCalledTimes(2);
          expect(mockHubConnection.start).toHaveBeenCalledTimes(2);
        });

        it("should apply default configurator", () => {
          expect(mockHubConnectionBuilder.withUrl).toHaveBeenCalledTimes(2);
          expect(mockHubConnectionBuilder.withUrl).toHaveBeenCalledWith(
            "http://somewhere:8081"
          );

          expect(
            mockHubConnectionBuilder.configureLogging
          ).toHaveBeenCalledTimes(2);
          expect(
            mockHubConnectionBuilder.configureLogging
          ).toHaveBeenCalledWith(LogLevel.Critical);

          expect(
            mockHubConnectionBuilder.withAutomaticReconnect
          ).toHaveBeenCalledTimes(2);
        });
      });
    });

    describe("When custom configurator used", () => {
      beforeEach(async () => {
        act(() => {
          root = render(
            <SignalRProvider
              onConnected={onConnected}
              configuratorFn={(buider, { connectionUrl }) => {
                buider.withUrl(connectionUrl);

                return buider;
              }}
              connectionUrl="https://localhost:3000"
            >
              <div>My DOM Tree.</div>
            </SignalRProvider>
          );
        });

        await waitFor(() => expect(onConnected).toHaveBeenCalledTimes(1));
      });

      it("should apply custom configurator", () => {
        expect(mockHubConnectionBuilder.withUrl).toHaveBeenCalledTimes(1);
        expect(mockHubConnectionBuilder.withUrl).toHaveBeenCalledWith(
          "https://localhost:3000"
        );

        expect(
          mockHubConnectionBuilder.configureLogging
        ).not.toHaveBeenCalled();

        expect(
          mockHubConnectionBuilder.withAutomaticReconnect
        ).not.toHaveBeenCalled();
      });
    });
  });

  describe("When connect unsuccessful", () => {
    let onConnected;
    let onError;

    beforeEach(() => {
      onConnected = jest.fn();
      onError = jest.fn();
    });

    describe("When onError() is present", () => {
      beforeEach(async () => {
        act(() => {
          root = render(
            <SignalRProvider
              onConnected={onConnected}
              onError={onError}
              connectionUrl="http://somewhere:8081"
            >
              <div>My DOM Tree.</div>
            </SignalRProvider>
          );
        });

        await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
      });

      it("should never call onConnected", () => {
        expect(onConnected).not.toHaveBeenCalled();
      });

      it("should not try to stop not open connection", () => {
        expect(mockHubConnection.stop).not.toHaveBeenCalled();
      });
    });

    describe("When onError() is not present", () => {
      // it just has a uncaught rejected promise
    });
  });
});
