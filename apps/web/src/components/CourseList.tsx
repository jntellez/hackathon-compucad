import type { Course } from '../types';
import { CourseCard } from './CourseCard';

type CourseListProps = {
  courses: Course[];
  selectedCollaborator: boolean;
  enrolledCourseIds: Set<number>;
  loading: boolean;
  onEnroll: (courseId: number) => void;
};

export function CourseList({ courses, selectedCollaborator, enrolledCourseIds, loading, onEnroll }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <p className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
        No courses match your filters.
      </p>
    );
  }

  return (
    <div className="max-h-[480px] space-y-1.5 overflow-y-auto pr-1">
      {courses.map((course) => {
        const enrolled = enrolledCourseIds.has(course.id);
        return (
          <CourseCard
            key={course.id}
            course={course}
            enrolled={enrolled}
            canEnroll={selectedCollaborator && !enrolled && !loading}
            onEnroll={onEnroll}
          />
        );
      })}
    </div>
  );
}
