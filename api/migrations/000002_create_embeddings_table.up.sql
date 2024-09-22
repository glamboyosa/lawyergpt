CREATE TABLE embeddings (
    id VARCHAR(255) PRIMARY KEY,
    resource_id VARCHAR(255),
    content TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_embeddings_resource_id ON embeddings (resource_id);
