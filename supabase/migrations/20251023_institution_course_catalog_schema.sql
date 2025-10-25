/*
  # Akada Phase 2B: Institution & Course Catalog Schema Migration
  
  Creates comprehensive database foundation for Institution & Course Catalog features:
  - 5 new tables (courses, program_courses, alumni_testimonials, program_scholarships, program_comparisons)
  - Enhanced programs table with application details
  - Proper RLS policies and performance indexes
  
  This migration enables:
  - Complete course catalog system with prerequisites
  - Alumni testimonial system with approval workflow
  - Program-specific scholarship opportunities
  - User program comparison feature (up to 3 programs)
  - Enhanced program application information
*/

-- ==========================================
-- 1. COURSES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Course identification
  course_code VARCHAR(20) NOT NULL,
  course_name TEXT NOT NULL,
  credits DECIMAL(4,2) NOT NULL CHECK (credits > 0),
  
  -- Course content
  course_description TEXT,
  syllabus_topics TEXT[], -- Array of main topics covered
  prerequisites TEXT[], -- Array of prerequisite course codes
  
  -- Assessment
  assessment_breakdown JSONB, -- {"assignments": 30, "midterm": 20, "final": 50}
  
  -- Metadata
  course_level VARCHAR(20) CHECK (course_level IN ('undergraduate', 'graduate', 'postgraduate')),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique course codes
  UNIQUE(course_code)
);

COMMENT ON TABLE courses IS 'Reusable course definitions that can be linked to multiple programs';
COMMENT ON COLUMN courses.course_code IS 'Standard course code (e.g., CS101, BUS201)';
COMMENT ON COLUMN courses.prerequisites IS 'Array of course codes that must be completed first';
COMMENT ON COLUMN courses.assessment_breakdown IS 'JSONB object with assessment types and percentages';

-- ==========================================
-- 2. PROGRAM_COURSES TABLE (Junction)
-- ==========================================

CREATE TABLE IF NOT EXISTS program_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Course context within program
  year INTEGER CHECK (year BETWEEN 1 AND 6), -- Support up to 6-year programs
  semester INTEGER CHECK (semester BETWEEN 1 AND 3), -- 1=Fall, 2=Spring, 3=Summer
  is_required BOOLEAN DEFAULT true,
  course_order INTEGER, -- Display order within year/semester
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate course assignments
  UNIQUE(program_id, course_id)
);

COMMENT ON TABLE program_courses IS 'Links programs to courses with context (year, semester, required vs elective)';
COMMENT ON COLUMN program_courses.semester IS '1=Fall, 2=Spring, 3=Summer';
COMMENT ON COLUMN program_courses.is_required IS 'True for required courses, false for electives';

-- ==========================================
-- 3. ALUMNI_TESTIMONIALS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS alumni_testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Institution link (testimonials are institution-wide, not program-specific)
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  
  -- Student information
  student_name TEXT NOT NULL,
  graduation_year INTEGER CHECK (graduation_year BETWEEN 1950 AND 2100),
  degree_obtained TEXT,
  current_position TEXT,
  current_company TEXT,
  
  -- Testimonial content
  testimonial_text TEXT NOT NULL,
  profile_photo_url TEXT,
  
  -- Approval workflow
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Ratings
  rating DECIMAL(2,1) CHECK (rating BETWEEN 1.0 AND 5.0),
  would_recommend BOOLEAN,
  
  -- Tags for categorization
  tags TEXT[], -- ["academic", "career", "campus life", "international student"]
  
  -- Metadata
  featured BOOLEAN DEFAULT false, -- Highlight on homepage
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID, -- Admin user who approved
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE alumni_testimonials IS 'Alumni success stories and testimonials with approval workflow';
COMMENT ON COLUMN alumni_testimonials.status IS 'Workflow: pending → approved/rejected. Only approved shown publicly';
COMMENT ON COLUMN alumni_testimonials.featured IS 'True to display on homepage/landing page';
COMMENT ON COLUMN alumni_testimonials.tags IS 'Categorization tags for filtering testimonials';

-- ==========================================
-- 4. PROGRAM_SCHOLARSHIPS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS program_scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships (can be program-specific OR university-wide)
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  
  -- Scholarship details
  scholarship_name TEXT NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('full', 'partial', 'tuition-waiver', 'stipend', 'other')),
  
  -- Amount (in USD for consistency)
  amount_min_usd DECIMAL(10,2),
  amount_max_usd DECIMAL(10,2),
  coverage_details TEXT, -- What the scholarship covers
  
  -- Eligibility
  eligibility_criteria TEXT NOT NULL,
  eligible_countries TEXT[], -- Country codes, null = all countries
  min_gpa DECIMAL(3,2),
  
  -- Application
  application_deadline DATE,
  application_url TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  renewable BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- At least one of program_id or university_id must be set
  CHECK (program_id IS NOT NULL OR university_id IS NOT NULL)
);

COMMENT ON TABLE program_scholarships IS 'Scholarship opportunities (program-specific or university-wide)';
COMMENT ON COLUMN program_scholarships.type IS 'Type of scholarship: full, partial, tuition-waiver, stipend, other';
COMMENT ON COLUMN program_scholarships.eligible_countries IS 'Array of country codes. NULL means available to all countries';
COMMENT ON COLUMN program_scholarships.renewable IS 'True if scholarship can be renewed for multiple years';

-- ==========================================
-- 5. PROGRAM_COMPARISONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS program_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User ownership (all users are authenticated)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Programs being compared (max 3)
  program_ids UUID[] NOT NULL CHECK (array_length(program_ids, 1) <= 3 AND array_length(program_ids, 1) >= 2),
  
  -- User notes
  comparison_name TEXT,
  notes TEXT,
  
  -- State management
  is_active BOOLEAN DEFAULT true, -- Most recent comparison
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE program_comparisons IS 'User-saved program comparisons (2-3 programs per comparison)';
COMMENT ON COLUMN program_comparisons.program_ids IS 'Array of 2-3 program UUIDs to compare';
COMMENT ON COLUMN program_comparisons.is_active IS 'True for most recent/active comparison';

-- ==========================================
-- 6. UPDATE EXISTING PROGRAMS TABLE
-- ==========================================

-- Add application and requirement details to programs
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS program_url TEXT,
ADD COLUMN IF NOT EXISTS application_deadlines JSONB, -- [{"intake": "Fall 2025", "deadline": "2025-01-15", "type": "season"}]
ADD COLUMN IF NOT EXISTS intake_periods TEXT[], -- ["Fall", "Spring"] or ["January", "September"]
ADD COLUMN IF NOT EXISTS min_gpa DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS language_requirements JSONB, -- {"IELTS": 6.5, "TOEFL": 90}
ADD COLUMN IF NOT EXISTS required_documents TEXT[]; -- ["Transcripts", "SOP", "LORs"]

COMMENT ON COLUMN programs.program_url IS 'Official program page URL';
COMMENT ON COLUMN programs.application_deadlines IS 'JSONB array of intake/deadline objects with flexible format';
COMMENT ON COLUMN programs.intake_periods IS 'When students can start: ["Fall", "Spring"] or ["January", "September"]';
COMMENT ON COLUMN programs.language_requirements IS 'JSONB object with test names and minimum scores';
COMMENT ON COLUMN programs.required_documents IS 'Array of required application documents';

-- ==========================================
-- 7. PERFORMANCE INDEXES
-- ==========================================

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(course_level);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active) WHERE is_active = true;

-- Program courses indexes (critical for joins)
CREATE INDEX IF NOT EXISTS idx_program_courses_program ON program_courses(program_id);
CREATE INDEX IF NOT EXISTS idx_program_courses_course ON program_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_program_courses_year_semester ON program_courses(program_id, year, semester);

-- Alumni testimonials indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_university ON alumni_testimonials(university_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON alumni_testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON alumni_testimonials(university_id, status) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON alumni_testimonials(featured) WHERE featured = true;

-- Program scholarships indexes
CREATE INDEX IF NOT EXISTS idx_scholarships_program ON program_scholarships(program_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_university ON program_scholarships(university_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_type ON program_scholarships(type);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON program_scholarships(application_deadline) WHERE is_active = true;

-- Program comparisons indexes
CREATE INDEX IF NOT EXISTS idx_comparisons_user ON program_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_active ON program_comparisons(user_id, is_active) WHERE is_active = true;

-- ==========================================
-- 8. TRIGGERS FOR UPDATED_AT
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all new tables
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_courses_updated_at BEFORE UPDATE ON program_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alumni_testimonials_updated_at BEFORE UPDATE ON alumni_testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_scholarships_updated_at BEFORE UPDATE ON program_scholarships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_comparisons_updated_at BEFORE UPDATE ON program_comparisons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all new tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_comparisons ENABLE ROW LEVEL SECURITY;

-- Courses: Public read access
CREATE POLICY "Courses are viewable by everyone" 
  ON courses FOR SELECT 
  USING (true);

CREATE POLICY "Courses are modifiable by authenticated users" 
  ON courses FOR ALL 
  USING (auth.role() = 'authenticated');

-- Program courses: Public read access
CREATE POLICY "Program courses are viewable by everyone" 
  ON program_courses FOR SELECT 
  USING (true);

CREATE POLICY "Program courses are modifiable by authenticated users" 
  ON program_courses FOR ALL 
  USING (auth.role() = 'authenticated');

-- Alumni testimonials: Special policy - only show approved testimonials to public
CREATE POLICY "Approved testimonials are viewable by everyone" 
  ON alumni_testimonials FOR SELECT 
  USING (status = 'approved');

CREATE POLICY "All testimonials are viewable by authenticated users" 
  ON alumni_testimonials FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Testimonials are modifiable by authenticated users" 
  ON alumni_testimonials FOR ALL 
  USING (auth.role() = 'authenticated');

-- Program scholarships: Public read access
CREATE POLICY "Scholarships are viewable by everyone" 
  ON program_scholarships FOR SELECT 
  USING (true);

CREATE POLICY "Scholarships are modifiable by authenticated users" 
  ON program_scholarships FOR ALL 
  USING (auth.role() = 'authenticated');

-- Program comparisons: User-owned data only
CREATE POLICY "Users can view their own comparisons" 
  ON program_comparisons FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own comparisons" 
  ON program_comparisons FOR ALL 
  USING (auth.uid() = user_id);


