import { useCallback, useEffect, useState } from 'react';

import { fetchRecommendations } from '../api';
import type { Recommendation } from '../types';

export function useRecommendations(selectedId: number | null) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback(() => {
    setRecommendations([]);
  }, []);

  const reload = useCallback(async (collaboratorId: number) => {
    const response = await fetchRecommendations(collaboratorId);
    setRecommendations(response.data);
    setError(null);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      clear();
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const response = await fetchRecommendations(selectedId!);
        if (!cancelled) {
          setRecommendations(response.data);
          setError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : 'Failed to load recommendations');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [clear, selectedId]);

  return { recommendations, loading, reload, clear, error };
}
