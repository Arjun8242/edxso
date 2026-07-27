-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  college         VARCHAR(255),
  assignment_score NUMERIC(5,2) NOT NULL CHECK (assignment_score >= 0 AND assignment_score <= 100),
  video_score     NUMERIC(5,2) NOT NULL CHECK (video_score >= 0 AND video_score <= 100),
  ats_score       NUMERIC(5,2) NOT NULL CHECK (ats_score >= 0 AND ats_score <= 100),
  github_score    NUMERIC(5,2) NOT NULL CHECK (github_score >= 0 AND github_score <= 100),
  communication_score NUMERIC(5,2) NOT NULL CHECK (communication_score >= 0 AND communication_score <= 100),
  priority_score  NUMERIC(5,2) NOT NULL DEFAULT 0,
  priority_bucket VARCHAR(2) NOT NULL DEFAULT 'P3',
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id                          SERIAL PRIMARY KEY,
  candidate_id                INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  ui_quality                  INTEGER NOT NULL CHECK (ui_quality >= 0 AND ui_quality <= 100),
  state_handling              INTEGER NOT NULL CHECK (state_handling >= 0 AND state_handling <= 100),
  edge_case_thinking          INTEGER NOT NULL CHECK (edge_case_thinking >= 0 AND edge_case_thinking <= 100),
  architecture_understanding  INTEGER NOT NULL CHECK (architecture_understanding >= 0 AND architecture_understanding <= 100),
  communication               INTEGER NOT NULL CHECK (communication >= 0 AND communication <= 100),
  confidence                  INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  accessibility_awareness     INTEGER NOT NULL CHECK (accessibility_awareness >= 0 AND accessibility_awareness <= 100),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id            SERIAL PRIMARY KEY,
  candidate_id  INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  reviewer      VARCHAR(255) NOT NULL,
  note          TEXT NOT NULL,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_priority_bucket ON candidates(priority_bucket);
CREATE INDEX IF NOT EXISTS idx_candidates_priority_score ON candidates(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_assignment_score ON candidates(assignment_score);
CREATE INDEX IF NOT EXISTS idx_candidates_video_score ON candidates(video_score);
CREATE INDEX IF NOT EXISTS idx_candidates_ats_score ON candidates(ats_score);
CREATE INDEX IF NOT EXISTS idx_candidates_github_score ON candidates(github_score);
CREATE INDEX IF NOT EXISTS idx_candidates_communication_score ON candidates(communication_score);
CREATE INDEX IF NOT EXISTS idx_evaluations_candidate_id ON evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_notes_candidate_id ON notes(candidate_id);
