ALTER TABLE embeddings
ALTER COLUMN embedding TYPE vector(1536) USING embedding::vector(1536);