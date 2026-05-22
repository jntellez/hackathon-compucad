import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  cancelEnrollment,
  completeEnrollment,
  createEnrollment,
  fetchActiveEnrollments,
  fetchCollaborators,
  fetchCompletedEnrollments,
  fetchCourses,
  fetchRecommendations,
  type Collaborator,
  type Course,
  type Enrollment,
  type Recommendation
} from './api';

type Message = { type: 'success' | 'error'; text: string } | null;

const LEVELS = ['JUNIOR', 'MID', 'SENIOR'] as const;

export default function App() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeEnrollments, setActiveEnrollments] = useState<Enrollment[]>([]);
  const [completedEnrollments, setCompletedEnrollments] = useState<Enrollment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [message, setMessage] = useState<Message>(null);
  const [loading, setLoading] = useState(false);

  // Course filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterModality, setFilterModality] = useState('');

  const selected = collaborators.find((c) => c.id === selectedId) ?? null;

  // Derive unique filter options from loaded courses
  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category));
    return [...set].sort();
  }, [courses]);

  const modalities = useMemo(() => {
    const set = new Set(courses.map((c) => c.modality));
    return [...set].sort();
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase();
    return courses
      .filter((c) => c.status === 'ACTIVE')
      .filter((c) => {
        if (q && !(
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.provider.toLowerCase().includes(q) ||
          c.modality.toLowerCase().includes(q)
        )) return false;
        if (filterCategory && c.category !== filterCategory) return false;
        if (filterLevel && c.minimumRequiredLevel !== filterLevel) return false;
        if (filterModality && c.modality !== filterModality) return false;
        return true;
      });
  }, [courses, search, filterCategory, filterLevel, filterModality]);

  const refreshCollaboratorData = useCallback(async (collaboratorId: number) => {
    const [activeRes, completedRes, recommendationRes] = await Promise.all([
      fetchActiveEnrollments(collaboratorId),
      fetchCompletedEnrollments(collaboratorId),
      fetchRecommendations(collaboratorId)
    ]);

    return {
      activeEnrollments: activeRes.data,
      completedEnrollments: completedRes.data,
      recommendations: recommendationRes.data
    };
  }, []);

  // Load initial data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [collabRes, courseRes] = await Promise.all([fetchCollaborators(), fetchCourses()]);
        if (!cancelled) {
          setCollaborators(collabRes.data);
          setCourses(courseRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load data' });
        }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  // Load enrollments when collaborator changes
  useEffect(() => {
    if (!selectedId) {
      setActiveEnrollments([]);
      setCompletedEnrollments([]);
      setRecommendations([]);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await refreshCollaboratorData(selectedId!);
        if (!cancelled) {
          setActiveEnrollments(data.activeEnrollments);
          setCompletedEnrollments(data.completedEnrollments);
          setRecommendations(data.recommendations);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load collaborator data' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [refreshCollaboratorData, selectedId]);

  const flash = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const handleEnroll = async (courseId: number) => {
    if (!selectedId) return;
    try {
      await createEnrollment(selectedId, courseId);
      flash('success', 'Enrollment created successfully');
      const data = await refreshCollaboratorData(selectedId);
      setActiveEnrollments(data.activeEnrollments);
      setCompletedEnrollments(data.completedEnrollments);
      setRecommendations(data.recommendations);
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Enrollment failed');
    }
  };

  const handleCancel = async (enrollmentId: number) => {
    if (!selectedId) return;
    try {
      await cancelEnrollment(enrollmentId);
      flash('success', 'Enrollment cancelled');
      const data = await refreshCollaboratorData(selectedId);
      setActiveEnrollments(data.activeEnrollments);
      setCompletedEnrollments(data.completedEnrollments);
      setRecommendations(data.recommendations);
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Cancel failed');
    }
  };

  const handleComplete = async (enrollmentId: number) => {
    if (!selectedId) return;
    try {
      await completeEnrollment(enrollmentId);
      flash('success', 'Course completed! Points awarded');
      const data = await refreshCollaboratorData(selectedId);
      setActiveEnrollments(data.activeEnrollments);
      setCompletedEnrollments(data.completedEnrollments);
      setRecommendations(data.recommendations);
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Complete failed');
    }
  };

  const alreadyEnrolledCourseIds = new Set(activeEnrollments.map((e) => e.courseId));

  const filterSelectClass = 'rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none';

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-300">
            Demo
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Compucad Training Platform</h1>
          <p className="text-sm text-slate-400">Select a collaborator to manage their course enrollments</p>
        </header>

        {/* Message banner */}
        {message && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Collaborator selector */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <label htmlFor="collaborator-select" className="mb-2 block text-sm font-medium text-slate-300">
            Collaborator
          </label>
          <select
            id="collaborator-select"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">-- Select a collaborator --</option>
            {collaborators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.position.name} - {c.area.name})
              </option>
            ))}
          </select>

          {selected && (
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              <span className="text-slate-400">
                Score: <span className="text-slate-100">{selected.score}</span>
              </span>
              <span className="text-slate-400">
                Level: <span className="text-slate-100">{selected.position.level}</span>
              </span>
              <span className="text-slate-400">
                Status: <span className="text-slate-100">{selected.status}</span>
              </span>
            </div>
          )}
        </section>

        {/* Main content: two columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Available courses */}
          <section className="flex flex-col">
            <h2 className="mb-3 text-lg font-medium text-white">
              Available Courses <span className="text-sm font-normal text-slate-500">({filteredCourses.length})</span>
            </h2>

            {/* Search + filters */}
            <div className="mb-3 space-y-2">
              <input
                type="text"
                placeholder="Search by name, category, provider, modality..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={filterSelectClass}>
                  <option value="">All categories</option>
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className={filterSelectClass}>
                  <option value="">All levels</option>
                  {LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
                </select>
                <select value={filterModality} onChange={(e) => setFilterModality(e.target.value)} className={filterSelectClass}>
                  <option value="">All modalities</option>
                  {modalities.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {(search || filterCategory || filterLevel || filterModality) && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); setFilterCategory(''); setFilterLevel(''); setFilterModality(''); }}
                    className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable course list */}
            <div className="max-h-[480px] space-y-1.5 overflow-y-auto pr-1">
              {filteredCourses.length === 0 ? (
                <p className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
                  No courses match your filters.
                </p>
              ) : (
                filteredCourses.map((course) => {
                  const enrolled = alreadyEnrolledCourseIds.has(course.id);
                  return (
                    <div
                      key={course.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-100">{course.name}</p>
                        <p className="text-xs text-slate-400">
                          {course.category} &middot; {course.modality} &middot; {course.durationHours}h &middot; {course.pointsAwarded} pts
                        </p>
                        <p className="text-xs text-slate-500">
                          Min: {course.minimumRequiredLevel}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!selected || enrolled || loading}
                        onClick={() => handleEnroll(course.id)}
                        className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                          enrolled
                            ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                            : !selected
                              ? 'cursor-not-allowed bg-slate-800 text-slate-600'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                      >
                        {enrolled ? 'Enrolled' : 'Enroll'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Right: Recommendations and enrollments */}
          <section className="space-y-4">
            {/* Recommendations */}
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-white">
                Recommended Courses ({recommendations.length})
              </h2>
              {recommendations.length === 0 ? (
                <p className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
                  {selected ? 'No recommendations available' : 'Select a collaborator to see recommendations'}
                </p>
              ) : (
                <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                  {recommendations.slice(0, 8).map((recommendation) => {
                    const enrolled = alreadyEnrolledCourseIds.has(recommendation.course.id);
                    return (
                      <div
                        key={recommendation.course.id}
                        className="rounded-lg border border-slate-800 bg-slate-900 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-100">{recommendation.course.name}</p>
                            <p className="text-xs text-slate-400">
                              Score: {recommendation.score} &middot; {recommendation.eligible ? 'Eligible' : 'Blocked'}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={!selected || enrolled || loading || !recommendation.eligible}
                            onClick={() => handleEnroll(recommendation.course.id)}
                            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                              enrolled
                                ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                                : !selected || !recommendation.eligible
                                  ? 'cursor-not-allowed bg-slate-800 text-slate-600'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
                            }`}
                          >
                            {enrolled ? 'Enrolled' : 'Enroll'}
                          </button>
                        </div>

                        {recommendation.reasons.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs text-emerald-300">
                            {recommendation.reasons.map((reason) => (
                              <li key={reason}>• {reason}</li>
                            ))}
                          </ul>
                        )}

                        {recommendation.blockingReasons.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs text-rose-300">
                            {recommendation.blockingReasons.map((reason) => (
                              <li key={reason}>• {reason}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active enrollments */}
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-white">
                Active Enrollments ({activeEnrollments.length})
              </h2>
              {activeEnrollments.length === 0 ? (
                <p className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
                  {selected ? 'No active enrollments' : 'Select a collaborator to see enrollments'}
                </p>
              ) : (
                activeEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-100">{enrollment.course.name}</p>
                      <p className="text-xs text-slate-400">
                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleComplete(enrollment.id)}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Complete
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleCancel(enrollment.id)}
                        className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Completed history */}
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-white">
                Completed ({completedEnrollments.length})
              </h2>
              {completedEnrollments.length === 0 ? (
                <p className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
                  {selected ? 'No completed courses yet' : 'Select a collaborator to see history'}
                </p>
              ) : (
                completedEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="rounded-lg border border-slate-800 bg-slate-900 p-3"
                  >
                    <p className="text-sm font-medium text-slate-100">{enrollment.course.name}</p>
                    <p className="text-xs text-slate-400">
                      Completed: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      {enrollment.grade != null && ` &middot; Grade: ${enrollment.grade}`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
