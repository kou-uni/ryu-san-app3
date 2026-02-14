-- Neon PostgreSQL initialization script
-- Run this SQL in your Neon SQL Editor or via psql

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interviewee_name VARCHAR(255) NOT NULL,
  interview_date DATE NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_interviews_name ON interviews (interviewee_name);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews (interview_date DESC);

-- Insert sample data for testing
INSERT INTO interviews (interviewee_name, interview_date, content, summary) VALUES
  ('山田太郎', '2025-01-15', '新しい観光地開発について、地域住民の視点から貴重な意見をいただきました。特に環境保護と経済発展のバランスについて深い洞察がありました。', '観光地開発と環境保護のバランスについて'),
  ('佐藤花子', '2025-01-20', '伝統工芸の継承に関するインタビュー。若い世代への技術伝承の難しさと、新しいアプローチの必要性について語っていただきました。', '伝統工芸の継承と若者への技術伝承'),
  ('鈴木一郎', '2025-02-01', '地域活性化プロジェクトのリーダーとして、これまでの取り組みと今後の展望について詳しくお話しいただきました。', '地域活性化プロジェクトの現状と展望')
ON CONFLICT (id) DO NOTHING;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify setup
SELECT 'Table created successfully!' as status;
SELECT COUNT(*) as sample_data_count FROM interviews;
