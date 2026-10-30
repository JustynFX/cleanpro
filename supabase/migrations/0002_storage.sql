-- Phase 4: storage bucket for "job done" photos. Run once in Supabase > SQL Editor.
-- The bucket is public-read (so the customer page and email can show the photo) but nobody can
-- upload from the browser: there are NO insert policies, so only our server (service key) can write.
-- Files get unguessable names (jobId/random-uuid.jpg). Size limit 4 MB, images only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('job-photos', 'job-photos', true, 4194304, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
