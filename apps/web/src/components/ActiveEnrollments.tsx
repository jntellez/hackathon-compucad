import type { Enrollment } from '../types';

type ActiveEnrollmentsProps = {
  enrollments: Enrollment[];
  hasSelection: boolean;
  loading: boolean;
  onComplete: (enrollmentId: number) => void;
  onCancel: (enrollmentId: number) => void;
};

export function ActiveEnrollments({ enrollments, hasSelection, loading, onComplete, onCancel }: ActiveEnrollmentsProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-white">Active Enrollments ({enrollments.length})</h2>
      {enrollments.length === 0 ? (
        <p className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
          {hasSelection ? 'No active enrollments' : 'Select a collaborator to see enrollments'}
        </p>
      ) : (
        enrollments.map((enrollment) => (
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
                onClick={() => onComplete(enrollment.id)}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Complete
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => onCancel(enrollment.id)}
                className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
