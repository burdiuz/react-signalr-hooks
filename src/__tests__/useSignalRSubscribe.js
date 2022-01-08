import React from "react";
import { cleanup, act, render } from "@testing-library/react";
import { mockConnection } from "../useSignalRConnection";
import { useSignalRSubscribe } from "../useSignalRSubscribe";

jest.mock("../useSignalRConnection", () => {
  const mockConnection = {
    on: jest.fn(),
    off: jest.fn(),
  };

  return {
    mockConnection,
    useSignalRConnection: () => mockConnection,
  };
});

const Subscribe = ({ method, fn }) => {
  useSignalRSubscribe(method, fn);

  return <div>My DOM.</div>;
};

describe("useSignalRSubscribe()", () => {
  const method = "myMethod";
  const fn = () => null;
  let root = null;

  afterEach(() => {
    mockConnection.on.mockClear();
    mockConnection.off.mockClear();
    cleanup();
    root = null;
  });

  beforeEach(() => {
    act(() => {
      root = render(<Subscribe method={method} fn={fn} />);
    });
  });

  it("should subscribe to myMethod", () => {
    expect(mockConnection.on).toHaveBeenCalledTimes(1);
    expect(mockConnection.on).toHaveBeenCalledWith(method, fn);
  });

  describe("When rerendered", () => {
    beforeEach(async () => {
      root.rerender(<Subscribe method={method} fn={fn} />);
    });

    it("should not re-subscribe to myMethod", () => {
      expect(mockConnection.on).toHaveBeenCalledTimes(1);
    });
  });

  describe("When method changed", () => {
    beforeEach(async () => {
      root.rerender(<Subscribe method="otherMethod" fn={fn} />);
    });

    it("should unsubscribe from myMethod", () => {
      expect(mockConnection.off).toHaveBeenCalledTimes(1);
      expect(mockConnection.off).toHaveBeenCalledWith(method, fn);
    });

    it("should subscribe to otherMethod", () => {
      expect(mockConnection.on).toHaveBeenCalledTimes(2);
      expect(mockConnection.on).toHaveBeenCalledWith("otherMethod", fn);
    });
  });

  describe("When callback changed", () => {
    let newFn = () => null;

    beforeEach(async () => {
      root.rerender(<Subscribe method={method} fn={newFn} />);
    });

    it("should unsubscribe previous callback from myMethod", () => {
      expect(mockConnection.off).toHaveBeenCalledTimes(1);
      expect(mockConnection.off).toHaveBeenCalledWith(method, fn);
    });

    it("should subscribe new callback to myMethod", () => {
      expect(mockConnection.on).toHaveBeenCalledTimes(2);
      expect(mockConnection.on).toHaveBeenCalledWith(method, newFn);
    });
  });
});
