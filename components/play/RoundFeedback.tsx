import { useId, type Ref } from "react";

import { normalizeTitle } from "@/lib/play/grading";
import { answerReasoning } from "@/lib/play/reasoning";
import { sizeRule } from "@/lib/play/result";
import { PASS_ACCURACY, type PlayResult } from "@/lib/play/types";

import styles from "./GamePlayer.module.css";

const resultTitles: Record<PlayResult["outcome"], string> = {
  correct: "Correct!",
  assisted: "Correct with a hint!",
  revealed: "Answer revealed",
  skipped: "Question skipped",
  within: "Level passed",
  low: "Below range",
  high: "Above range",
  incorrect: "Not quite",
};

const measurement = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 8 });

export function Accuracy({ value, retry = false, feedback }: { value: number; retry?: boolean; feedback?: string }) {
  const rounded = Math.round(value * 100) / 100;
  const label = rounded === PASS_ACCURACY && rounded !== value
    ? `${value > rounded ? ">" : "<"}${rounded}`
    : String(rounded);
  return (
    <div className={styles.accuracy} data-passed={value > PASS_ACCURACY}>
      {feedback && <p><strong>{feedback}</strong></p>}
      <p><strong>{label}%</strong> accuracy</p>
      <meter min={0} max={100} value={value} aria-label="Answer accuracy" />
      {retry && <p>Score more than {PASS_ACCURACY}% to unlock the next question. Try again.</p>}
    </div>
  );
}

function displayAnswer(value: PlayResult["answer"], unit?: string) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return unit ? `${measurement.format(value)} ${unit}` : measurement.format(value);
  return value;
}

function sameAnswer(guess: PlayResult["guess"], answer: PlayResult["answer"]) {
  return typeof guess === "string" && typeof answer === "string"
    ? normalizeTitle(guess) === normalizeTitle(answer)
    : guess === answer;
}

function resultTitle({ accuracy, outcome }: PlayResult) {
  if (accuracy !== undefined && accuracy <= PASS_ACCURACY) return "Not quite";
  if (accuracy !== undefined && accuracy < 100) return "Level passed";
  return resultTitles[outcome];
}

export function RoundFeedback({ result, prompt, headingRef }: {
  result: PlayResult;
  prompt: string;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const statusId = useId();
  const { clues, explanation } = answerReasoning(prompt, result.explanation);
  const { answer, guess, unit, accuracy } = result;
  const sources = result.sources.filter(({ url }) => /^https?:\/\//i.test(url));

  return (
    <div className={styles.result}>
      <h3 ref={headingRef} tabIndex={-1} aria-describedby={statusId} className={styles.answerHeading}>
        {displayAnswer(answer, unit)}
      </h3>
      <p className={styles.resultStatus} id={statusId}>{resultTitle(result)}</p>

      {clues.length > 0 && (
        <blockquote className={styles.keyClue}>
          <p className={styles.clueLabel}>{clues.length === 1 ? "Key clue" : "Key clues"}</p>
          {clues.map((clue, index) => <p key={index}><q><mark>{clue}</mark></q></p>)}
        </blockquote>
      )}
      {explanation && (
        <div>
          <h4 className={styles.explanationTitle}>Why it matters</h4>
          <p className={styles.explanation}>{explanation}</p>
        </div>
      )}

      {guess !== undefined && !sameAnswer(guess, answer) && (
        <dl className={styles.values}>
          <div><dt>Your guess</dt><dd>{displayAnswer(guess, unit)}</dd></div>
        </dl>
      )}
      {accuracy !== undefined && <Accuracy value={accuracy} />}
      {typeof answer === "number" && <p className={styles.explanation}>{sizeRule}</p>}
      {sources.length > 0 && (
        <ul className={styles.sources} aria-label="Sources">
          {sources.map(({ label, url }) => <li key={url}><a href={url}>{label}</a></li>)}
        </ul>
      )}
    </div>
  );
}
