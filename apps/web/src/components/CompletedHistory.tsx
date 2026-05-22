import type { Enrollment } from '../types';

type CompletedHistoryProps = {
  enrollments: Enrollment[];
  hasSelection: boolean;
};

export function CompletedHistory({ enrollments, hasSelection }: CompletedHistoryProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-white">Completed ({enrollments.length})</h2>
      {enrollments.length === 0 ? (
        <p className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
          {hasSelection ? 'No completed courses yet' : 'Select a collaborator to see history'}
        </p>
      ) : (
        enrollments.map((enrollment) => (
          <div key={enrollment.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <p className="text-sm font-medium text-slate-100">{enrollment.course.name}</p>
            <p className="text-xs text-slate-400">
              Completed: {new Date(enrollment.enrolledAt).toLocaleDateString()}
              {enrollment.grade != null && ` · Grade: ${enrollment.grade}`}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
