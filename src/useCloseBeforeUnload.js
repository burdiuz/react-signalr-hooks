import { useEffect } from 'react';

import { useSignalRConnection } from './useSignalRConnection';

export const useCloseBeforeUnload = () => {
  const connection = useSignalRConnection();
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      connection?.stop();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [connection]);
};
