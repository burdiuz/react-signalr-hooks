import React from "react";
import { cleanup, fireEvent } from "@testing-library/react";
import { provideConnected } from "../testUtils";
import { mockHubConnection, resetSignalRMocks } from "@microsoft/signalr";
import { useCloseBeforeUnload } from "../useCloseBeforeUnload";

jest.mock("@microsoft/signalr");

const BeforeUnload = () => {
  useCloseBeforeUnload();

  return <div>My DOM.</div>;
};

describe("useCloseBeforeUnload()", () => {
  let root = null;

  afterEach(() => {
    cleanup();
    resetSignalRMocks();
    root = null;
  });

  beforeEach(async () => {
    mockHubConnection.start.mockImplementation(() => Promise.resolve());
    mockHubConnection.stop.mockImplementation(() => Promise.resolve());

    root = await provideConnected(<BeforeUnload />)();
  });

  describe("When beforeunload event fired", () => {
    beforeEach(() => {
      fireEvent(window, new Event("beforeunload"));
    });

    it("should close connection", () => {
      expect(mockHubConnection.stop).toHaveBeenCalledTimes(1);
    });
  });
});
