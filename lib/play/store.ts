import { getCloudflareContext } from "@opennextjs/cloudflare";

import { STATISTICS_SQL, type GameStatistics } from "./statistics";
import type { AnswerConfig, PlayResult, PrivateRound, Source } from "./types";

type SqlValue = string | number | null;

type StatementResult<T> = {
  results: T[];
  meta: { changes: number };
};

type Statement = {
  bind(...values: SqlValue[]): Statement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<StatementResult<T>>;
  run(): Promise<StatementResult<unknown>>;
};

type PlayDatabase = {
  prepare(sql: string): Statement;
  batch<T>(statements: Statement[]): Promise<StatementResult<T>[]>;
};

type RoundRow = {
  id: string;
  version: number;
  hint_count: number;
  result_json: string | null;
  session_id: string | null;
  created_at: number;
  question_id: string;
  game_slug: string;
  revision: number;
  prompt: string;
  hints_json: string;
  answer_config_json: string;
  explanation: string;
  sources_json: string;
};

type SelectionOptions = {
  /** Newest first so the previous question can be avoided when the pool cycles. */
  recentQuestionIds?: string[];
  sessionId?: string;
  topic?: string;
  difficulty?: string;
  prefetch?: boolean;
};

type RoundUpdate = {
  sessionId: string;
  hintCount?: number;
  result?: PlayResult;
};

const selectRound = `
  SELECT r.id, r.version, r.hint_count, r.result_json, r.session_id, r.created_at,
         r.question_id, q.game_slug, v.revision, v.prompt, v.hints_json,
         v.answer_config_json, v.explanation, v.sources_json
  FROM game_rounds AS r
  JOIN questions AS q ON q.id = r.question_id
  JOIN question_revisions AS v
    ON v.question_id = r.question_id AND v.revision = r.question_revision
  WHERE q.game_slug = ? AND r.id = ?
    AND (v.invalidated_at IS NULL OR r.result_json IS NOT NULL)
`;

function unpackRound(row: RoundRow): PrivateRound {
  return {
    id: row.id,
    version: row.version,
    hintCount: row.hint_count,
    sessionId: row.session_id,
    createdAt: row.created_at,
    result: row.result_json === null ? null : (JSON.parse(row.result_json) as PlayResult),
    question: {
      questionId: row.question_id,
      gameSlug: row.game_slug,
      revision: row.revision,
      prompt: row.prompt,
      hints: JSON.parse(row.hints_json) as string[],
      answerConfig: JSON.parse(row.answer_config_json) as AnswerConfig,
      explanation: row.explanation,
      sources: JSON.parse(row.sources_json) as Source[],
    },
  };
}

export class QuestionStore {
  constructor(private readonly db: PlayDatabase) {}

  async startRound(
    gameSlug: string,
    {
      recentQuestionIds = [],
      sessionId,
      topic,
      difficulty,
      prefetch = false,
    }: SelectionOptions = {},
  ): Promise<PrivateRound | null> {
    const roundId = crypto.randomUUID();
    const now = Date.now();
    const select = this.db.prepare(selectRound).bind(gameSlug, roundId);
    const insert = this.db
      .prepare(`
        INSERT INTO game_rounds (
          id, question_id, question_revision, session_id, created_at, activated_at
        )
        SELECT ?, q.id, v.revision, ?, ?, ?
        FROM questions AS q
        JOIN question_revisions AS v
          ON v.question_id = q.id AND v.revision = q.published_revision
        WHERE q.game_slug = ? AND q.status = 'published'
          AND q.published_revision IS NOT NULL AND v.invalidated_at IS NULL
          AND (? IS NULL OR q.topic_slug = ?) AND (? IS NULL OR q.difficulty = ?)
        ORDER BY CASE
          WHEN q.id = ? THEN 2
          WHEN q.id IN (SELECT value FROM json_each(?)) THEN 1
          ELSE 0
        END, random()
        LIMIT 1
      `)
      .bind(
        roundId,
        sessionId ?? null,
        now,
        sessionId && !prefetch ? now : null,
        gameSlug,
        topic ?? null,
        topic ?? null,
        difficulty ?? null,
        difficulty ?? null,
        recentQuestionIds[0] ?? null,
        JSON.stringify(recentQuestionIds),
      );

    const [, selected] = await this.db.batch<RoundRow>([insert, select]);
    return selected.results[0] ? unpackRound(selected.results[0]) : null;
  }

  async getRound(gameSlug: string, roundId: string): Promise<PrivateRound | null> {
    const row = await this.db.prepare(selectRound).bind(gameSlug, roundId).first<RoundRow>();
    return row ? unpackRound(row) : null;
  }

  async saveRound(round: PrivateRound, update: RoundUpdate): Promise<boolean> {
    const now = Date.now();
    const result = await this.db
      .prepare(`
        UPDATE game_rounds
        SET version = version + 1,
            session_id = COALESCE(session_id, ?),
            activated_at = COALESCE(activated_at, ?),
            hint_count = CASE WHEN result_json IS NOT NULL THEN hint_count ELSE MAX(hint_count, ?) END,
            result_json = COALESCE(result_json, ?),
            settled_at = COALESCE(settled_at, ?)
        WHERE id = ? AND version = ? AND (session_id IS NULL OR session_id = ?)
          AND (result_json IS NOT NULL OR EXISTS (
            SELECT 1 FROM question_revisions AS v
            WHERE v.question_id = game_rounds.question_id
              AND v.revision = game_rounds.question_revision AND v.invalidated_at IS NULL
          ))
      `)
      .bind(
        update.sessionId,
        now,
        update.hintCount ?? round.hintCount,
        update.result ? JSON.stringify(update.result) : null,
        update.result ? now : null,
        round.id,
        round.version,
        update.sessionId,
      )
      .run();

    return result.meta.changes === 1;
  }

  async listTopics(gameSlug: string): Promise<{ slug: string; name: string }[]> {
    const result = await this.db
      .prepare(`
        SELECT t.slug, t.name
        FROM topics AS t
        WHERE t.game_slug = ? AND EXISTS (
          SELECT 1
          FROM questions AS q
          JOIN question_revisions AS v
            ON v.question_id = q.id AND v.revision = q.published_revision
          WHERE q.game_slug = t.game_slug AND q.topic_slug = t.slug
            AND q.status = 'published' AND q.published_revision IS NOT NULL
            AND v.invalidated_at IS NULL
        )
        ORDER BY t.name COLLATE NOCASE, t.slug
      `)
      .bind(gameSlug)
      .all<{ slug: string; name: string }>();

    return result.results;
  }

  async getStatistics(gameSlug?: string): Promise<GameStatistics[]> {
    const { results } = await this.db.prepare(STATISTICS_SQL).all<GameStatistics>();
    return gameSlug ? results.filter((entry) => entry.gameSlug === gameSlug) : results;
  }
}

export async function getQuestionStore(): Promise<QuestionStore> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.PLAY_DB) throw new Error("PLAY_DB is not configured");

  return new QuestionStore(env.PLAY_DB);
}
