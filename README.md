# Talentify: AI-Powered Resume Screening Platform
A full-stack web application that uses advanced AI, NLP, and BERT models to intelligently screen, categorize, and rank resumes based on specific job requirements.

- [
## Some Images

<img width="1919" height="986" alt="Image" src="https://github.com/user-attachments/assets/58e26a0e-136f-4299-92a4-719c0bc0ec72" />

<img width="1838" height="923" alt="Screenshot 2025-10-04 205847" src="https://github.com/user-attachments/assets/aceab93c-4f5f-4398-beae-871c83425383" />

<img width="1919" height="984" alt="Image" src="https://github.com/user-attachments/assets/19ff2105-65a6-40c5-b42e-1e358bb6ec9e" />
ect Structure
The project is organized with a root folder containing the backend and frontend directories.

```bash

AI Resume Screener/
├── backend/
│   ├── uploads/
│   ├── venv/
│   ├── .env
│   ├── app.py
│   ├── resume_matcher.py
│   ├── text_extractor.py
│   ├── text_processor.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## Features
- **Modern UI/UX**: A clean, responsive, and intuitive interface built with React and TypeScript.

- **Simple 3-Step Process**: A guided workflow: Job Setup → Upload Resumes → View Results.

- **Real-time Processing**: Live progress indicators provide immediate feedback during uploads and screening.

- **Advanced Filtering & Sorting**: Easily sort and filter candidates by match score, name, or category.

- **Bulk Operations**: Download all or just the shortlisted resumes as a single .zip file.

- **Secure Authentication**: Complete user authentication flow including sign-up, login, forgot password, and OTP email verification.

- **BERT Embeddings for Semantic Matching**: Understands the context of the job description and resume, not just keywords, using Sentence Transformers.

- **Multi-Format File Processing**: Extracts text seamlessly from PDF and DOCX files.

## 🛠️ Tech Stack
```bash
Category                Technology

Frontend                React, TypeScript, Tailwind CSS, Lucide Icons

Backend                 Flask(Python), Supabase (PostgreSQL), NLTK, Sentence Transformers, scikit-learn

Document Processing     PyPDF2, python-docx

AI/ML Libraries         sentence-transformers, scikit-learn, nltk, numpy
```

## 📋 Prerequisites
- Python 3.8+

- Node.js 16+ (for the frontend)

- A free [Supabase](https://supabase.com/) account

- A Gmail account with 2FA enabled (for sending OTP emails)

## 🚀 Quick Start
### 1. Clone the Repository
First, clone the project from GitHub and navigate into the root directory.
```bash
git clone https://github.com/siddharthdogra03/Talentify--ai-resume-screener.git
```

### 2. Backend Setup
Navigate to the backend directory, create a virtual environment, and install the required Python packages.

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Setup
In a new terminal, navigate to the frontend directory and install the required Node.js packages.

```bash
cd frontend
npm install
```

### 4. Environment Configuration
In the backend directory, create a .env file. 
```bash
# Supabase Credentials
SUPABASE_URL=""
SUPABASE_KEY=""
# Replace with your actual Supabase Project URL and Anon Public Key

SMTP_USER=''  # <--- IMPORTANT: Replace with your Gmail address
SMTP_PASS=''
PORT=5000

```

### 5. Database Setup (Supabase)
Log in to your Supabase dashboard and run the following SQL query in the SQL Editor to create the users table.
```bash
-- 1. Users Table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    otp TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    role TEXT,
    hr_id TEXT,
    full_name TEXT,
    position TEXT,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Jobs Table
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

-- 3. Resumes Table
CREATE TABLE resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    raw_text TEXT,
    processed_text TEXT,
    extracted_skills TEXT[],
    categorized_field TEXT,
    upload_date TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Screening Results Table
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

-- 5. Notifications Table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Run the Application
You'll need to run the backend and frontend in two separate terminals.

**Terminal 1: Run the Backend (from the backend directory)**
```bash
# Make sure your virtual environment is activated
flask run or python app.py
```
Your backend will now be running on http://127.0.0.1:5000.

**Terminal 2: Run the Frontend (from the frontend directory)**
```bash
npm run dev
```
Your frontend will open in your browser, usually at http://localhost:5173.

## AI/ML Pipeline Explained
The resume screening process is a multi-stage pipeline designed for accuracy and relevance.

1. Text Extraction: The system first extracts raw text from uploaded files, supporting .pdf and .docx formats.

2. Text Preprocessing: The raw text is cleaned using NLTK. This involves removing URLs, converting to lowercase, tokenizing, removing stop-words, and lemmatizing words.

3. Skill & Category Extraction: The processed text is scanned to identify hundreds of predefined skills and to assign the resume a primary job category (e.g., "Tech", "Design").

4. Scoring Algorithm: A final score is calculated using a weighted average of three key metrics:

    - Semantic Similarity (15%): Uses BERT embeddings to compare the contextual meaning of the resume against the job description.
    
    - Skill Match (75%): The most important factor. It's the percentage of required skills found in the resume.
    
    - Experience Match (10%): Analyzes the resume text for years of experience or keywords like "senior" to match the required experience level.

## API Endpoints
A comprehensive RESTful API powers the application.
```bash
Method      Endpoint                                Description
----------  --------------------------------------  ------------------------------------------------------------
POST        /api/signup                             Register a new user.
POST        /api/login                              Log in an existing user.
POST        /api/verify_otp                         Verify a user's email with an OTP.
POST        /api/forgot_password                    Request a password reset OTP.
POST        /api/reset_password                     Reset password using OTP.
GET         /api/profile                            Get current user profile (session based).
GET         /api/user/<user_id>                     Get public profile of a user.
POST        /api/update_profile                     Update user profile details.
POST        /api/select_role                        Set user role (HR/Candidate) and details.
GET         /api/jobs                               Get all job listings.
GET         /api/jobs/<user_id>                     Get jobs posted by a specific user.
POST        /api/job_requirements                   Save new job requirements (description, skills).
POST        /api/upload_resumes                     Upload and process one or more resume files.
POST        /api/screen_resumes                     Run the AI screening matching algorithm.
GET         /api/dashboard_data                     Fetch ranked screening results (can filter/sort).
GET         /api/notifications/<user_id>            Fetch system notifications for a user.
POST        /api/notifications/.../read             Mark specific (or all) notifications as read.
GET         /api/resume/<resume_id>                 Fetch raw text content of a resume.
POST        /api/download_resume                    Download a specific resume file.
GET         /api/download_all_resumes/<job_id>      Download all resumes for a job as ZIP.
POST        /api/download_all_filtered_resumes      Download a ZIP of specific filtered resumes.
POST        /api/clear_session_data                 Clear temporary session data (Logout).
```

## 🤝 Contributing
Contributions are welcome! Please fork the repository, create a new feature branch, and open a pull request.
