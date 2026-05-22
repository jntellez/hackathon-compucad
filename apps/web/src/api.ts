import type { AgentMessage, AgentResponse, Collaborator, Course, Enrollment, Recommendation } from './types';

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

export async function fetchRecommendations(collaboratorId: number) {
  return request<DataEnvelope<Recommendation[]>>(`/api/collaborators/${collaboratorId}/recommendations`);
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

export async function sendAgentMessage(collaboratorId: number, message: string) {
  const payload: AgentMessage = { collaboratorId, message };
  return request<DataEnvelope<AgentResponse>>('/api/agent/message', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
