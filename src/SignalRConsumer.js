import React from 'react';

import { Consumer } from './context';

export const SignalRConsumer = ({ children }) => (
  <Consumer>{children}</Consumer>
);
