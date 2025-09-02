CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  cuisine VARCHAR,
  title VARCHAR NOT NULL,
  rating REAL,
  prep_time INT,
  cook_time INT,
  total_time INT,
  description TEXT,
  nutrients JSONB,
  serves VARCHAR
);

CREATE INDEX IF NOT EXISTS idx_recipes_rating ON recipes (rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_recipes_total_time ON recipes (total_time);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes (cuisine);
