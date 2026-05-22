import { useCallback, useEffect, useState } from 'react';

import { fetchActiveEnrollments, fetchCompletedEnrollments } from '../api';
import type { Enrollment } from '../types';

export function useEnrollments(selectedId: number | null) {
  const [activeEnrollments, setActiveEnrollments] = useState<Enrollment[]>([]);
  const [completedEnrollments, setCompletedEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback(() => {
    setActiveEnrollments([]);
    setCompletedEnrollments([]);
  }, []);

  const reload = useCallback(async (collaboratorId: number) => {
    const [activeResponse, completedResponse] = await Promise.all([
      fetchActiveEnrollments(collaboratorId),
      fetchCompletedEnrollments(collaboratorId)
    ]);

    setActiveEnrollments(activeResponse.data);
    setCompletedEnrollments(completedResponse.data);
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
        const [activeResponse, completedResponse] = await Promise.all([
          fetchActiveEnrollments(selectedId!),
          fetchCompletedEnrollments(selectedId!)
        ]);

        if (!cancelled) {
          setActiveEnrollments(activeResponse.data);
          setCompletedEnrollments(completedResponse.data);
          setError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : 'Failed to load enrollments');
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

  return { activeEnrollments, completedEnrollments, loading, reload, clear, error };
}
