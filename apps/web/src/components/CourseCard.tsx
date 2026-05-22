import type { Course } from '../types';

type CourseCardProps = {
  course: Course;
  enrolled: boolean;
  canEnroll: boolean;
  onEnroll: (courseId: number) => void;
};

export function CourseCard({ course, enrolled, canEnroll, onEnroll }: CourseCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-100">{course.name}</p>
        <p className="text-xs text-slate-400">
          {course.category} &middot; {course.modality} &middot; {course.durationHours}h &middot; {course.pointsAwarded} pts
        </p>
        <p className="text-xs text-slate-500">Min: {course.minimumRequiredLevel}</p>
      </div>
      <button
        type="button"
        disabled={!canEnroll}
        onClick={() => onEnroll(course.id)}
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
  );
}
