-- Create contact_submissions table (simplified version)
DROP TABLE IF EXISTS contact_submissions;

CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Simple policy: allow anyone to insert
CREATE POLICY "Allow contact form submissions" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view all submissions
CREATE POLICY "Allow viewing submissions" ON contact_submissions
  FOR SELECT USING (true);
