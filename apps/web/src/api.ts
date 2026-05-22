const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type ApiError = {
  error: string | { code: string; message: string };
  message: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    const message = typeof body.error === 'object' ? body.error.message : body.message;
    throw new Error(message);
  }

  const json = await response.json();
  return json as T;
}

// --- Types ---

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

type DataEnvelope<T> = { data: T };

// --- API functions ---

export async function fetchCollaborators() {
  return request<DataEnvelope<Collaborator[]>>('/api/collaborators');
}

export async function fetchCourses() {
  return request<DataEnvelope<Course[]>>('/api/courses');
}

export async function fetchActiveEnrollments(collaboratorId: number) {
  return request<DataEnvelope<Enrollment[]>>(`/api/collaborators/${collaboratorId}/enrollments`);
}

export async function fetchCompletedEnrollments(collaboratorId: number) {
  return request<DataEnvelope<Enrollment[]>>(`/api/collaborators/${collaboratorId}/history`);
}

export async function createEnrollment(collaboratorId: number, courseId: number) {
  return request<DataEnvelope<Enrollment>>('/api/enrollments', {
    method: 'POST',
    body: JSON.stringify({ collaboratorId, courseId })
  });
}

export async function cancelEnrollment(enrollmentId: number) {
  return request<DataEnvelope<Enrollment>>(`/api/enrollments/${enrollmentId}/cancel`, {
    method: 'POST'
  });
}

export async function completeEnrollment(enrollmentId: number) {
  return request<DataEnvelope<Enrollment>>(`/api/enrollments/${enrollmentId}/complete`, {
    method: 'POST'
  });
}
