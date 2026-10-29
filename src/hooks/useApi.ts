import { useCallback, useEffect, useState } from 'react';
import type { DependencyList } from 'react';
import { getErrorMessage } from '../utils/apiClient';

export function useApi<T>(fetcher: () => Promise<T>, deps: DependencyList, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    fetcher().
    then((result) => {
      if (active) setData(result);
    }).
    catch((err: unknown) => {
      if (active) setError(getErrorMessage(err));
    }).
    finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, enabled]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, setData, loading, error, reload };
}