import type { Course, CourseFilters } from '../types';

export function getUniqueCategories(courses: Course[]) {
  return [...new Set(courses.map((course) => course.category))].sort();
}

export function getUniqueModalities(courses: Course[]) {
  return [...new Set(courses.map((course) => course.modality))].sort();
}

export function filterCourses(courses: Course[], filters: CourseFilters) {
  const query = filters.search.toLowerCase();

  return courses
    .filter((course) => course.status === 'ACTIVE')
    .filter((course) => {
      if (
        query &&
        ![
          course.name,
          course.category,
          course.provider,
          course.modality
        ].some((value) => value.toLowerCase().includes(query))
      ) {
        return false;
      }

      if (filters.category && course.category !== filters.category) return false;
      if (filters.level && course.minimumRequiredLevel !== filters.level) return false;
      if (filters.modality && course.modality !== filters.modality) return false;

      return true;
    });
}
