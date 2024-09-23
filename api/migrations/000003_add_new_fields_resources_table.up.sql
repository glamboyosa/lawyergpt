-- Add new columns
ALTER TABLE resources
ADD COLUMN filename VARCHAR(255),
ADD COLUMN url VARCHAR(255);


-- Alter columns to be nullable (matching the struct definition)
ALTER TABLE resources
ALTER COLUMN filename DROP NOT NULL,
ALTER COLUMN url DROP NOT NULL;