export type QuestionType = "single" | "multiple" | "text";

export type PollOption = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  title: string;
  type: QuestionType;
  required: boolean;
  options: PollOption[];
};

export type PollSettings = {
  anonymousResponses: boolean;
  authenticatedOnly: boolean;
  resultsVisibility: boolean;
  expiresAt: string;
};

export type AdvancedSettings = {
  allowResponseEditing: boolean;
  timerEnabled: boolean;
  timerMinutes: number;
};

export const MAX_QUESTIONS = 10;
