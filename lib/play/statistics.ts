export type GameStatistics = {
  gameSlug: string;
  sessions: number;
  roundsStarted: number;
  roundsSettled: number;
  sessionsFirstSettled: number;
  sessionsSecondStarted: number;
  independentCorrect: number;
  assistedCorrect: number;
  revealed: number;
};

export const STATISTICS_SQL = `
  WITH activated_rounds AS (
    SELECT q.game_slug, r.session_id, r.activated_at, r.settled_at,
           json_extract(r.result_json, '$.outcome') AS outcome,
           row_number() OVER (
             PARTITION BY q.game_slug, r.session_id
             ORDER BY r.activated_at, r.created_at, r.id
           ) AS round_number
    FROM game_rounds AS r
    JOIN questions AS q ON q.id = r.question_id
    WHERE r.activated_at IS NOT NULL
  ), sessions AS (
    SELECT game_slug, COUNT(*) AS rounds_started,
           COUNT(settled_at) AS rounds_settled,
           MAX(settled_at) FILTER (WHERE round_number = 1) AS first_settled_at,
           MAX(activated_at) FILTER (WHERE round_number = 2) AS second_started_at,
           COUNT(*) FILTER (WHERE outcome = 'correct') AS independent_correct,
           COUNT(*) FILTER (WHERE outcome = 'assisted') AS assisted_correct,
           COUNT(*) FILTER (WHERE outcome = 'revealed') AS revealed
    FROM activated_rounds
    GROUP BY game_slug, session_id
  )
  SELECT game_slug AS gameSlug,
         COUNT(*) AS sessions,
         SUM(rounds_started) AS roundsStarted,
         SUM(rounds_settled) AS roundsSettled,
         COUNT(first_settled_at) AS sessionsFirstSettled,
         COUNT(*) FILTER (WHERE second_started_at >= first_settled_at) AS sessionsSecondStarted,
         SUM(independent_correct) AS independentCorrect,
         SUM(assisted_correct) AS assistedCorrect,
         SUM(revealed) AS revealed
  FROM sessions
  GROUP BY game_slug
  ORDER BY game_slug
`;
