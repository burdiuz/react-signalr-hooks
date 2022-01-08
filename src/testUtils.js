import React from "react";
import { act, render, waitFor } from "@testing-library/react";
import { SignalRProvider } from "./SignalRProvider";

export const provideConnected =
  (children, previousRoot, condition) =>
  async ({ onConnected = jest.fn(), ...props } = {}) => {
    let root;

    act(() => {
      root = (previousRoot ? previousRoot.rerender : render)(
        <SignalRProvider
          onConnected={onConnected}
          connectionUrl="http://localhost:8000"
          {...props}
        >
          {children}
        </SignalRProvider>
      );
    });

    if (previousRoot) {
      return previousRoot;
    }

    await waitFor(
      condition || (() => expect(onConnected).toHaveBeenCalledTimes(1))
    );

    return root;
  };

export const provideFailed =
  (children, previousRoot, condition) =>
  async ({ onError = jest.fn(), ...props } = {}) => {
    let root;

    act(() => {
      root = (previousRoot ? previousRoot.rerender : render)(
        <SignalRProvider
          onError={onError}
          connectionUrl="http://localhost:8000"
          {...props}
        >
          {children}
        </SignalRProvider>
      );
    });

    if (previousRoot) {
      return root;
    }

    await waitFor(
      condition || (() => expect(onError).toHaveBeenCalledTimes(1))
    );

    return root;
  };
