import { useCallback, useEffect, useState } from 'react';
import { fetchOverview, Overview, StatsRange } from '@/lib/apiServices';

interface Loaded {
  range: StatsRange;
  nonce: number;
  data?: Overview;
  error?: string;
}

/**
 * Dashboard numbers for one period. While a new period or a refresh loads,
 * the previous numbers stay on screen (`loading` is true) — no flash.
 */
export function useOverview(range: StatsRange) {
  const [nonce, setNonce] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchOverview(range, nonce > 0).then(
      (data) => !cancelled && setLoaded({ range, nonce, data }),
      (err: unknown) =>
        !cancelled &&
        setLoaded((prev) => ({
          range,
          nonce,
          // Keep old numbers only when they are for this same period (a failed refresh).
          data: prev?.range === range ? prev.data : undefined,
          error: err instanceof Error ? err.message : 'Could not load the numbers',
        }))
    );
    return () => {
      cancelled = true;
    };
  }, [range, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data: loaded?.data ?? null,
    error: loaded?.error ?? null,
    loading: !loaded || loaded.range !== range || loaded.nonce !== nonce,
    refresh,
  };
}
