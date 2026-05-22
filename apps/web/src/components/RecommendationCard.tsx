import type { Recommendation } from '../types';

type RecommendationCardProps = {
  recommendation: Recommendation;
  enrolled: boolean;
  canEnroll: boolean;
  onEnroll: (courseId: number) => void;
};

export function RecommendationCard({ recommendation, enrolled, canEnroll, onEnroll }: RecommendationCardProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-100">{recommendation.course.name}</p>
          <p className="text-xs text-slate-400">
            Score: {recommendation.score} · {recommendation.eligible ? 'Eligible' : 'Blocked'}
          </p>
        </div>
        <button
          type="button"
          disabled={!canEnroll}
          onClick={() => onEnroll(recommendation.course.id)}
          className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            enrolled
              ? 'cursor-not-allowed bg-slate-800 text-slate-500'
              : canEnroll
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'cursor-not-allowed bg-slate-800 text-slate-600'
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
}
