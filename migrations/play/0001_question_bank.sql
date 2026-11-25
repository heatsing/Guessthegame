CREATE TABLE games (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  answer_type TEXT NOT NULL CHECK (answer_type IN ('title', 'number', 'boolean')),
  retry_policy TEXT NOT NULL CHECK (retry_policy IN ('retry', 'once')),
  locale TEXT NOT NULL DEFAULT 'en'
) STRICT;

INSERT INTO games (slug, name, answer_type, retry_policy) VALUES
  ('guess-the-movie', 'Guess the Movie', 'title', 'retry'),
  ('guess-the-book', 'Guess the Book', 'title', 'retry'),
  ('guess-the-size', 'Guess the Size', 'number', 'once'),
  ('yes-or-no', 'Yes or No?', 'boolean', 'once'),
  ('guess-the-word', 'Guess the Word', 'title', 'retry'),
  ('guess-the-plant', 'Guess the Plant', 'title', 'retry');

CREATE TABLE topics (
  game_slug TEXT NOT NULL REFERENCES games (slug),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  PRIMARY KEY (game_slug, slug)
) STRICT;

CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  game_slug TEXT NOT NULL REFERENCES games (slug),
  question_key TEXT NOT NULL,
  topic_slug TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  published_revision INTEGER CHECK (published_revision BETWEEN 1 AND revision),
  updated_at INTEGER NOT NULL,
  UNIQUE (game_slug, question_key),
  FOREIGN KEY (game_slug, topic_slug) REFERENCES topics (game_slug, slug),
  CHECK (status != 'published' OR published_revision IS NOT NULL)
) STRICT;

CREATE INDEX questions_published_pool ON questions (game_slug, topic_slug, difficulty)
  WHERE status = 'published' AND published_revision IS NOT NULL;

CREATE TABLE question_revisions (
  question_id TEXT NOT NULL REFERENCES questions (id),
  revision INTEGER NOT NULL CHECK (revision >= 1),
  prompt TEXT NOT NULL CHECK (length(trim(prompt)) > 0),
  hints_json TEXT NOT NULL CHECK (json_valid(hints_json) AND json_type(hints_json) = 'array'),
  answer_config_json TEXT NOT NULL CHECK (json_valid(answer_config_json) AND json_type(answer_config_json) = 'object'),
  explanation TEXT NOT NULL CHECK (length(trim(explanation)) > 0),
  sources_json TEXT NOT NULL CHECK (json_valid(sources_json) AND json_type(sources_json) = 'array'),
  created_at INTEGER NOT NULL,
  invalidated_at INTEGER,
  PRIMARY KEY (question_id, revision)
) STRICT;

CREATE TABLE game_rounds (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  question_revision INTEGER NOT NULL,
  version INTEGER NOT NULL DEFAULT 0 CHECK (version >= 0),
  hint_count INTEGER NOT NULL DEFAULT 0 CHECK (hint_count >= 0),
  result_json TEXT CHECK (result_json IS NULL OR json_valid(result_json)),
  session_id TEXT,
  created_at INTEGER NOT NULL,
  activated_at INTEGER,
  settled_at INTEGER,
  FOREIGN KEY (question_id, question_revision) REFERENCES question_revisions (question_id, revision),
  CHECK (activated_at IS NULL OR session_id IS NOT NULL),
  CHECK ((result_json IS NULL) = (settled_at IS NULL))
) STRICT;
