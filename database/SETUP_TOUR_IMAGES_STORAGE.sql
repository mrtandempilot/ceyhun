-- Create storage bucket for tour images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tour-images', 'tour-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for tour images bucket
-- Allow public read access
CREATE POLICY "Public Access for tour images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tour-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload tour images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tour-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update tour images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'tour-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete tour images"
ON storage.objects FOR DELETE
USING (bucket_id = 'tour-images' AND auth.role() = 'authenticated');
