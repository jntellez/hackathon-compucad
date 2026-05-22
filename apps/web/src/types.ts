export type Position = { id: number; name: string; level: string };
export type Area = { id: number; name: string };

export type Collaborator = {
  id: number;
  name: string;
  email: string;
  positionId: number;
  areaId: number;
  hireDate: string;
  status: string;
  score: number;
  yearsExperience: number;
  englishLevel: string;
  city: string;
  workMode: string;
  interests: string;
  position: Position;
  area: Area;
};

export type Course = {
  id: number;
  name: string;
  category: string;
  provider: string;
  modality: string;
  courseLevel: string;
  durationHours: number;
  maxCapacity: number;
  status: string;
  minimumRequiredLevel: string;
  cost: number;
  pointsAwarded: number;
};

export type Enrollment = {
  id: number;
  collaboratorId: number;
  courseId: number;
  enrolledAt: string;
  status: string;
  grade: number | null;
  course: Course;
};

export type Recommendation = {
  course: Course;
  score: number;
  eligible: boolean;
  reasons: string[];
  blockingReasons: string[];
};

export type Message = { type: 'success' | 'error'; text: string } | null;

export type CourseFilters = {
  search: string;
  category: string;
  level: string;
  modality: string;
};

export const LEVELS = ['JUNIOR', 'MID', 'SENIOR'] as const;
