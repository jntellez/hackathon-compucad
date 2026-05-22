import { useCallback, useEffect, useMemo, useState } from 'react';

import { cancelEnrollment, completeEnrollment, createEnrollment } from '../api';
import type { CourseFilters, Message } from '../types';
import { useCollaborators } from './useCollaborators';
import { useCourses } from './useCourses';
import { useEnrollments } from './useEnrollments';
import { useRecommendations } from './useRecommendations';
import { filterCourses, getUniqueCategories, getUniqueModalities } from '../utils/filters';

const defaultFilters: CourseFilters = {
  search: '',
  category: '',
  level: '',
  modality: ''
};

export function useTrainingDemo() {
  const { collaborators, loading: collaboratorsLoading, error: collaboratorsError } = useCollaborators();
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState<CourseFilters>(defaultFilters);

  const selectedCollaborator = collaborators.find((collaborator) => collaborator.id === selectedId) ?? null;

  const {
    activeEnrollments,
    completedEnrollments,
    loading: enrollmentsLoading,
    reload: reloadEnrollments,
    error: enrollmentsError
  } = useEnrollments(selectedId);

  const {
    recommendations,
    loading: recommendationsLoading,
    reload: reloadRecommendations,
    error: recommendationsError
  } = useRecommendations(selectedId);

  const loading = collaboratorsLoading || coursesLoading || enrollmentsLoading || recommendationsLoading || actionLoading;

  const categories = useMemo(() => getUniqueCategories(courses), [courses]);
  const modalities = useMemo(() => getUniqueModalities(courses), [courses]);
  const filteredCourses = useMemo(() => filterCourses(courses, filters), [courses, filters]);
  const alreadyEnrolledCourseIds = useMemo(
    () => new Set(activeEnrollments.map((enrollment) => enrollment.courseId)),
    [activeEnrollments]
  );

  const flash = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 5000);
  }, []);

  useEffect(() => {
    const error = collaboratorsError ?? coursesError ?? enrollmentsError ?? recommendationsError;
    if (error) {
      setMessage({ type: 'error', text: error });
    }
  }, [collaboratorsError, coursesError, enrollmentsError, recommendationsError]);

  const refreshSelectedCollaboratorData = useCallback(async () => {
    if (!selectedId) return;
    await Promise.all([reloadEnrollments(selectedId), reloadRecommendations(selectedId)]);
  }, [reloadEnrollments, reloadRecommendations, selectedId]);

  const handleEnroll = useCallback(async (courseId: number) => {
    if (!selectedId) return;

    setActionLoading(true);
    try {
      await createEnrollment(selectedId, courseId);
      await refreshSelectedCollaboratorData();
      flash('success', 'Enrollment created successfully');
    } catch (error) {
      flash('error', error instanceof Error ? error.message : 'Enrollment failed');
    } finally {
      setActionLoading(false);
    }
  }, [flash, refreshSelectedCollaboratorData, selectedId]);

  const handleCancel = useCallback(async (enrollmentId: number) => {
    if (!selectedId) return;

    setActionLoading(true);
    try {
      await cancelEnrollment(enrollmentId);
      await refreshSelectedCollaboratorData();
      flash('success', 'Enrollment cancelled');
    } catch (error) {
      flash('error', error instanceof Error ? error.message : 'Cancel failed');
    } finally {
      setActionLoading(false);
    }
  }, [flash, refreshSelectedCollaboratorData, selectedId]);

  const handleComplete = useCallback(async (enrollmentId: number) => {
    if (!selectedId) return;

    setActionLoading(true);
    try {
      await completeEnrollment(enrollmentId);
      await refreshSelectedCollaboratorData();
      flash('success', 'Course completed! Points awarded');
    } catch (error) {
      flash('error', error instanceof Error ? error.message : 'Complete failed');
    } finally {
      setActionLoading(false);
    }
  }, [flash, refreshSelectedCollaboratorData, selectedId]);

  const updateFilter = useCallback(<K extends keyof CourseFilters>(key: K, value: CourseFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    collaborators,
    selectedId,
    setSelectedId,
    selectedCollaborator,
    message,
    filteredCourses,
    categories,
    modalities,
    filters,
    updateFilter,
    clearFilters,
    activeEnrollments,
    completedEnrollments,
    recommendations,
    alreadyEnrolledCourseIds,
    loading,
    handleEnroll,
    handleCancel,
    handleComplete
  };
}
