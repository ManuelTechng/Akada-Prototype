-- Create an index on the 'name' column of the 'programs' table
CREATE INDEX idx_programs_name ON programs USING gin (to_tsvector('english', name));

-- Create an index on the 'content' column of the 'knowledge_base' table
CREATE INDEX idx_knowledge_base_content ON knowledge_base USING gin (to_tsvector('english', content));

-- Note: For basic ILIKE performance, B-tree indexes might be sufficient and simpler.
-- However, GIN indexes with to_tsvector are better for full-text search capabilities,
-- which ILIKE with '%' wildcards at the beginning and end often implies a need for.
-- If only suffix/prefix matching is needed, specific B-tree ops classes can be used.

-- Simpler B-tree indexes for ILIKE (if GIN is overkill or not compatible with specific Supabase/Postgres setup for basic ILIKE):
-- CREATE INDEX idx_programs_name_btree ON programs (name text_pattern_ops);
-- CREATE INDEX idx_knowledge_base_content_btree ON knowledge_base (content text_pattern_ops);
-- Choose the appropriate indexing strategy based on the exact query patterns and database version.
-- For general text searching with ILIKE '%query%', GIN indexes are generally more performant for larger datasets.
