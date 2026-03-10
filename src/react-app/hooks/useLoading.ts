import { useState } from 'react';

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  const withLoading = async <T,>(promise: Promise<T>): Promise<T> => {
    startLoading();
    try {
      const result = await promise;
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}
