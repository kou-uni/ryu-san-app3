-- Create interviews table for Nagasaki Mogi interview management app
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interviewee_name VARCHAR(255) NOT NULL,
  interview_date DATE NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_interviews_name ON public.interviews (interviewee_name);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON public.interviews (interview_date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read interviews
CREATE POLICY "Allow authenticated users to read interviews"
  ON public.interviews
  FOR SELECT
  USING (true);

-- Create policy to allow all authenticated users to insert interviews
CREATE POLICY "Allow authenticated users to insert interviews"
  ON public.interviews
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own interviews
CREATE POLICY "Allow users to update interviews"
  ON public.interviews
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow users to delete interviews
CREATE POLICY "Allow users to delete interviews"
  ON public.interviews
  FOR DELETE
  USING (true);
