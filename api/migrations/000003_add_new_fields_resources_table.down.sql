-- Remove the new columns
ALTER TABLE resources
DROP COLUMN filename,
DROP COLUMN url;