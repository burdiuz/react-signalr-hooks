import React from "react";
import { cleanup } from "@testing-library/react";
import { provideConnected } from "../testUtils";
import { mockHubConnection, resetSignalRMocks } from "@microsoft/signalr";
import { SignalRConsumer } from "../SignalRConsumer";

jest.mock("@microsoft/signalr");

describe("SignalRConsumer", () => {
  let root = null;

  afterEach(() => {
    cleanup();
    resetSignalRMocks();
    root = null;
  });

  describe("When created", () => {
    let connection;

    beforeEach(async () => {
      mockHubConnection.start.mockImplementation(() => Promise.resolve());

      root = await provideConnected(
        <SignalRConsumer>
          {([connection, connected]) => {
            return (
              <div>
                {String(!!connection)} and {String(connected)}
              </div>
            );
          }}
        </SignalRConsumer>
      )();
    });

    it("should render children", () => {
      expect(root.container).toMatchInlineSnapshot(`
<div>
  <div>
    true
     and 
    true
  </div>
</div>
`);
    });
  });
});
