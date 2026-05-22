import type { Recommendation } from '../types';
import { RecommendationCard } from './RecommendationCard';

type RecommendationsListProps = {
  recommendations: Recommendation[];
  hasSelection: boolean;
  enrolledCourseIds: Set<number>;
  loading: boolean;
  onEnroll: (courseId: number) => void;
};

export function RecommendationsList({ recommendations, hasSelection, enrolledCourseIds, loading, onEnroll }: RecommendationsListProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-white">Recommended Courses</h2>
      {recommendations.length === 0 ? (
        <p className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
          {hasSelection ? 'No recommendations available' : 'Select a collaborator to see recommendations'}
        </p>
      ) : (
        <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
          {recommendations.slice(0, 8).map((recommendation) => {
            const enrolled = enrolledCourseIds.has(recommendation.course.id);
            return (
              <RecommendationCard
                key={recommendation.course.id}
                recommendation={recommendation}
                enrolled={enrolled}
                canEnroll={hasSelection && !enrolled && !loading && recommendation.eligible}
                onEnroll={onEnroll}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
