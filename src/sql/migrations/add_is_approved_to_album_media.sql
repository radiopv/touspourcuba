ALTER TABLE album_media ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT NULL;