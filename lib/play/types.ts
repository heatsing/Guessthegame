export type AnswerType = "title" | "number" | "boolean";

export type PlayGame = {
  slug: string;
  name: string;
  answerType: AnswerType;
  title: string;
  description: string;
  rule: string;
};

export type Source = { label: string; url: string };

export type AnswerConfig =
  | { type: "title"; answer: string; aliases: string[] }
  | { type: "number"; target: number; unit: string; min: number; max: number }
  | { type: "boolean"; answer: boolean };

export type QuestionVersion = {
  questionId: string;
  gameSlug: string;
  revision: number;
  prompt: string;
  hints: string[];
  answerConfig: AnswerConfig;
  explanation: string;
  sources: Source[];
};

export type PublicRound = {
  id: string;
  questionId: string;
  revision: number;
  prompt: string;
  answerType: AnswerType;
  unit?: string;
};

export type PlayResult = {
  outcome: "correct" | "assisted" | "revealed" | "within" | "low" | "high" | "incorrect";
  answer: string | number | boolean;
  guess?: string | number | boolean;
  unit?: string;
  min?: number;
  max?: number;
  explanation: string;
  sources: Source[];
};

export type PrivateRound = {
  id: string;
  question: QuestionVersion;
  version: number;
  hintCount: number;
  result: PlayResult | null;
  sessionId: string | null;
  createdAt: number;
};
