-- Jobs Table
CREATE TABLE jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    department TEXT,
    skills TEXT[] NOT NULL, -- Array of strings
    experience_required TEXT,
    location TEXT,
    job_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes Table
CREATE TABLE resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id), -- Optional: link to uploader if needed
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL, -- Path in local uploads folder
    raw_text TEXT,
    processed_text TEXT,
    extracted_skills TEXT[],
    categorized_field TEXT,
    upload_date TIMESTAMPTZ DEFAULT NOW()
);

-- Screening Results Table
CREATE TABLE screening_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id),
    resume_id UUID REFERENCES resumes(id),
    match_score FLOAT,
    matched_skills TEXT[],
    department_match TEXT,
    experience_level TEXT,
    categorized_field TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
