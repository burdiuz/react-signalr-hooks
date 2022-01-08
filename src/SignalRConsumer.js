import React from "react";
import PropTypes from "prop-types";

import { Consumer } from "./context";

export const SignalRConsumer = ({ children }) => (
  <Consumer>{children}</Consumer>
);

SignalRConsumer.propTypes = {
  children: PropTypes.func.isRequired,
};
