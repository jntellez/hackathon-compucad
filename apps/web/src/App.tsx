import { useCallback, useEffect, useState } from 'react';

import {
  cancelEnrollment,
  completeEnrollment,
  createEnrollment,
  fetchActiveEnrollments,
  fetchCollaborators,
  fetchCompletedEnrollments,
  fetchCourses,
  type Collaborator,
  type Course,
  type Enrollment
} from './api';

type Message = { type: 'success' | 'error'; text: string } | null;

export default function App() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeEnrollments, setActiveEnrollments] = useState<Enrollment[]>([]);
  const [completedEnrollments, setCompletedEnrollments] = useState<Enrollment[]>([]);
  const [message, setMessage] = useState<Message>(null);
  const [loading, setLoading] = useState(false);

  const selected = collaborators.find((c) => c.id === selectedId) ?? null;

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
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [activeRes, completedRes] = await Promise.all([
          fetchActiveEnrollments(selectedId!),
          fetchCompletedEnrollments(selectedId!)
        ]);
        if (!cancelled) {
          setActiveEnrollments(activeRes.data);
          setCompletedEnrollments(completedRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load enrollments' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [selectedId]);

  const flash = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const handleEnroll = async (courseId: number) => {
    if (!selectedId) return;
    try {
      await createEnrollment(selectedId, courseId);
      flash('success', 'Enrollment created successfully');
      // Refresh enrollments
      const [activeRes, completedRes] = await Promise.all([
        fetchActiveEnrollments(selectedId),
        fetchCompletedEnrollments(selectedId)
      ]);
      setActiveEnrollments(activeRes.data);
      setCompletedEnrollments(completedRes.data);
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Enrollment failed');
    }
  };

  const handleCancel = async (enrollmentId: number) => {
    if (!selectedId) return;
    try {
      await cancelEnrollment(enrollmentId);
      flash('success', 'Enrollment cancelled');
      const [activeRes, completedRes] = await Promise.all([
        fetchActiveEnrollments(selectedId),
        fetchCompletedEnrollments(selectedId)
      ]);
      setActiveEnrollments(activeRes.data);
      setCompletedEnrollments(completedRes.data);
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Cancel failed');
    }
  };

  const handleComplete = async (enrollmentId: number) => {
    if (!selectedId) return;
    try {
      await completeEnrollment(enrollmentId);
      flash('success', 'Course completed! Points awarded');
      const [activeRes, completedRes] = await Promise.all([
        fetchActiveEnrollments(selectedId),
        fetchCompletedEnrollments(selectedId)
      ]);
      setActiveEnrollments(activeRes.data);
      setCompletedEnrollments(completedRes.data);
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Complete failed');
    }
  };

  const alreadyEnrolledCourseIds = new Set(activeEnrollments.map((e) => e.courseId));

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
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-white">Available Courses</h2>
            <div className="space-y-2">
              {courses
                .filter((c) => c.status === 'ACTIVE')
                .map((course) => {
                  const enrolled = alreadyEnrolledCourseIds.has(course.id);
                  return (
                    <div
                      key={course.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-100">{course.name}</p>
                        <p className="text-xs text-slate-400">
                          {course.category} &middot; {course.modality} &middot; {course.durationHours}h &middot;{' '}
                          {course.pointsAwarded} pts
                        </p>
                        <p className="text-xs text-slate-500">
                          Min level: {course.minimumRequiredLevel}
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
                })}
            </div>
          </section>

          {/* Right: Enrollments */}
          <section className="space-y-4">
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
