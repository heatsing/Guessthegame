import type { DailyAnswer, PlayableScreenshot } from "./load-puzzle";

export type DailyApiOk = {
  ok: true;
  date: string;
  screenshots: PlayableScreenshot[];
  maxGuesses: number;
  answer: DailyAnswer;
};

export type DailyApiEmpty = {
  ok: false;
  date: string;
  reason: "not_ready";
};

export type DailyApiResponse = DailyApiOk | DailyApiEmpty;
