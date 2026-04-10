-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    match_score NUMERIC(5, 2),
    matched_skills JSONB DEFAULT '[]',
    missing_skills JSONB DEFAULT '[]',
    bullet_suggestions JSONB DEFAULT '[]',
    summary TEXT,
    job_description TEXT,
    resume_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read their own analyses
CREATE POLICY "Users can view own analyses"
    ON analyses FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: service role can insert
CREATE POLICY "Service role can insert analyses"
    ON analyses FOR INSERT
    WITH CHECK (true);
