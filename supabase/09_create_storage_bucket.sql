-- ============================================
-- Create Storage Bucket for Task Attachments
-- ============================================
-- Run this in Supabase SQL Editor
-- Creates storage bucket for file attachments
-- ============================================

-- Create storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-attachments',
  'task-attachments',
  true, -- Public bucket (or set to false and use RLS)
  10485760, -- 10MB limit
  ARRAY['image/*', 'application/pdf', 'text/*', 'application/*']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-attachments' AND
  auth.role() = 'authenticated'
);

-- Create storage policy for authenticated users to read files
CREATE POLICY "Authenticated users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'task-attachments');

-- Create storage policy for users to delete their own files
CREATE POLICY "Users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'task-attachments' AND
  auth.role() = 'authenticated'
);
