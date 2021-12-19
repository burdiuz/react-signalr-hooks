import React from 'react';

import { Consumer } from './context';

export const RealtimeConsumer = ({ children }) => (
  <Consumer>{children}</Consumer>
);
