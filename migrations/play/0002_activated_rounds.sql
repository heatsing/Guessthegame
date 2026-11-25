CREATE INDEX game_rounds_activated_question_sessions
  ON game_rounds (question_id, session_id, activated_at)
  WHERE activated_at IS NOT NULL;
