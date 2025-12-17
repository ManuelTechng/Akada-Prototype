-- Add intent metadata to programs table for Intelligent Scraper Agents
ALTER TABLE "programs"
ADD COLUMN "intent_metadata" JSONB DEFAULT '{}';

-- Create GIN index for efficient querying of the JSONB data
CREATE INDEX "idx_programs_intent_metadata" ON "programs" USING GIN ("intent_metadata");

COMMENT ON COLUMN "programs"."intent_metadata" IS 'Stores AI-extracted metadata for intent-based search (e.g. safety_score, budget_friendly)';
