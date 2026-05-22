export const SUPPORTED_INTENTS = [
  'list_courses',
  'get_active_enrollments',
  'get_completed_courses',
  'recommend_courses',
  'enroll_course',
  'cancel_enrollment',
  'complete_enrollment',
  'unknown'
] as const;

export type AgentIntent = (typeof SUPPORTED_INTENTS)[number];

export type AgentAction =
  | 'list_courses'
  | 'get_active_enrollments'
  | 'get_completed_courses'
  | 'recommend_courses'
  | 'enroll_course'
  | 'cancel_enrollment'
  | 'complete_enrollment'
  | 'clarify_intent';

export type AgentExtraction = {
  intent: AgentIntent;
  confidence: 'high' | 'medium' | 'low';
  clarificationQuestion?: string;
  parameters: {
    courseName?: string;
    enrollmentId?: number;
  };
};

export type AgentUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type AgentMessageData = {
  message: string;
  intent: AgentIntent;
  action: AgentAction;
  result: unknown;
  usage: AgentUsage;
};
