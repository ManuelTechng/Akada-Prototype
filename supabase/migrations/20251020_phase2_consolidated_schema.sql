/*
  # Akada Phase 2: Consolidated Database Schema Migration
  
  Creates comprehensive database foundation for Phase 2 features:
  - 6 new tables (countries, cities, universities, flight_routes, application_guides, scholarship_opportunities)
  - Enhanced programs table with foreign key references
  - Proper RLS policies and performance indexes
  - Initial data seeding for Tier 1 countries and cities
  
  This migration is the foundation for all Phase 2 features including:
  - Enhanced Cost Calculator with multi-country support
  - School Details System with comprehensive university data
  - Flight cost integration with API-ready architecture
  - Admin interface data management
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENHANCED COUNTRIES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code VARCHAR(3) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT,
  currency_code VARCHAR(3),
  currency_symbol VARCHAR(5),
  
  -- Visa/Immigration
  visa_type TEXT,
  visa_fee_usd DECIMAL(10,2),
  visa_processing_days INTEGER,
  requires_biometrics BOOLEAN DEFAULT false,
  requires_medical BOOLEAN DEFAULT false,
  language_requirements TEXT,
  work_permit_hours_weekly INTEGER,
  post_study_work_duration TEXT,
  
  -- Living costs
  avg_living_cost_monthly_usd DECIMAL(10,2),
  living_cost_min_usd DECIMAL(10,2),
  living_cost_max_usd DECIMAL(10,2),
  healthcare_cost_monthly_usd DECIMAL(10,2),
  
  -- Country info
  climate TEXT,
  timezone TEXT,
  safety_index DECIMAL(5,2),
  is_origin_country BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. ENHANCED CITIES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country_code VARCHAR(3) REFERENCES countries(country_code),
  tier TEXT CHECK (tier IN ('major', 'mid', 'small')),
  
  -- Demographics
  population INTEGER,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  
  -- Living costs (monthly, local currency)
  accommodation_min DECIMAL(10,2),
  accommodation_max DECIMAL(10,2),
  food_monthly DECIMAL(10,2),
  transport_monthly DECIMAL(10,2),
  utilities_monthly DECIMAL(10,2),
  entertainment_monthly DECIMAL(10,2),
  currency_code VARCHAR(3) NOT NULL,
  
  -- City info
  climate TEXT,
  public_transport_quality TEXT CHECK (public_transport_quality IN ('excellent', 'good', 'fair', 'poor')),
  student_friendly_rating DECIMAL(3,1),
  
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. NEW UNIVERSITIES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country_code VARCHAR(3) REFERENCES countries(country_code),
  city_id UUID REFERENCES cities(id),
  
  -- Basic info
  type TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  founded_year INTEGER,
  
  -- Rankings
  ranking_world INTEGER,
  ranking_national INTEGER,
  
  -- Students
  total_students INTEGER,
  international_students INTEGER,
  acceptance_rate DECIMAL(5,2),
  
  -- Metadata
  accreditations TEXT[],
  contact_email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. NEW FLIGHT ROUTES TABLE (API-READY)
-- ==========================================

CREATE TABLE IF NOT EXISTS flight_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin_country_code VARCHAR(3) REFERENCES countries(country_code),
  destination_country_code VARCHAR(3) REFERENCES countries(country_code),
  
  -- Cost data
  avg_economy_cost DECIMAL(10,2) NOT NULL,
  avg_business_cost DECIMAL(10,2),
  currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  -- Metadata (API-ready architecture)
  data_source TEXT NOT NULL CHECK (data_source IN ('manual', 'skyscanner_api', 'amadeus_api', 'google_flights', 'user_reported')),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  api_provider TEXT,
  api_route_id TEXT,
  real_time_available BOOLEAN DEFAULT false,
  
  -- Flight details
  peak_season_multiplier DECIMAL(4,2) DEFAULT 1.3,
  typical_layovers INTEGER DEFAULT 1,
  avg_flight_duration_hours INTEGER,
  budget_airline_available BOOLEAN DEFAULT false,
  
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(origin_country_code, destination_country_code, data_source)
);

-- ==========================================
-- 5. NEW APPLICATION GUIDES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS application_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID REFERENCES universities(id),
  title TEXT NOT NULL,
  overview TEXT,
  steps JSONB NOT NULL,
  required_documents TEXT[],
  application_fee_usd DECIMAL(10,2),
  typical_response_weeks INTEGER,
  tips TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. NEW SCHOLARSHIP OPPORTUNITIES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS scholarship_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider TEXT,
  university_id UUID REFERENCES universities(id),
  country_code VARCHAR(3) REFERENCES countries(country_code),
  
  -- Funding details
  type TEXT CHECK (type IN ('full', 'partial', 'tuition-waiver', 'stipend')),
  amount_min_usd DECIMAL(10,2),
  amount_max_usd DECIMAL(10,2),
  coverage TEXT[],
  
  -- Eligibility
  eligible_countries TEXT[],
  requirements TEXT[],
  application_deadline DATE,
  website TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. UPDATE EXISTING PROGRAMS TABLE
-- ==========================================

-- Add foreign key references to new tables
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id),
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);

-- ==========================================
-- 8. PERFORMANCE INDEXES
-- ==========================================

-- Countries indexes
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(country_code);
CREATE INDEX IF NOT EXISTS idx_countries_origin ON countries(is_origin_country) WHERE is_origin_country = true;
CREATE INDEX IF NOT EXISTS idx_countries_active ON countries(is_active) WHERE is_active = true;

-- Cities indexes
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_code);
CREATE INDEX IF NOT EXISTS idx_cities_tier ON cities(tier);

-- Universities indexes
CREATE INDEX IF NOT EXISTS idx_universities_country ON universities(country_code);
CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city_id);
CREATE INDEX IF NOT EXISTS idx_universities_ranking ON universities(ranking_world);

-- Flight routes indexes (critical for cost calculator performance)
CREATE INDEX IF NOT EXISTS idx_flight_routes_lookup ON flight_routes(origin_country_code, destination_country_code);
CREATE INDEX IF NOT EXISTS idx_flight_routes_source ON flight_routes(data_source);
CREATE INDEX IF NOT EXISTS idx_flight_routes_updated ON flight_routes(last_updated);

-- Application guides indexes
CREATE INDEX IF NOT EXISTS idx_application_guides_university ON application_guides(university_id);

-- Scholarships indexes
CREATE INDEX IF NOT EXISTS idx_scholarships_university ON scholarship_opportunities(university_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_country ON scholarship_opportunities(country_code);
CREATE INDEX IF NOT EXISTS idx_scholarships_type ON scholarship_opportunities(type);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarship_opportunities(application_deadline);

-- Programs indexes for new foreign keys
CREATE INDEX IF NOT EXISTS idx_programs_university ON programs(university_id);
CREATE INDEX IF NOT EXISTS idx_programs_city ON programs(city_id);

-- ==========================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all new tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_opportunities ENABLE ROW LEVEL SECURITY;

-- Countries: Public read access
CREATE POLICY "Countries are viewable by everyone" ON countries FOR SELECT USING (true);
CREATE POLICY "Countries are modifiable by authenticated users" ON countries FOR ALL USING (auth.role() = 'authenticated');

-- Cities: Public read access
CREATE POLICY "Cities are viewable by everyone" ON cities FOR SELECT USING (true);
CREATE POLICY "Cities are modifiable by authenticated users" ON cities FOR ALL USING (auth.role() = 'authenticated');

-- Universities: Public read access (needed for cost calculator and searches)
CREATE POLICY "Universities are viewable by everyone" ON universities FOR SELECT USING (true);
CREATE POLICY "Universities are modifiable by authenticated users" ON universities FOR ALL USING (auth.role() = 'authenticated');

-- Flight routes: Public read access (needed for cost calculator)
CREATE POLICY "Flight routes are viewable by everyone" ON flight_routes FOR SELECT USING (true);
CREATE POLICY "Flight routes are modifiable by authenticated users" ON flight_routes FOR ALL USING (auth.role() = 'authenticated');

-- Application guides: Public read access
CREATE POLICY "Application guides are viewable by everyone" ON application_guides FOR SELECT USING (true);
CREATE POLICY "Application guides are modifiable by authenticated users" ON application_guides FOR ALL USING (auth.role() = 'authenticated');

-- Scholarships: Public read access
CREATE POLICY "Scholarships are viewable by everyone" ON scholarship_opportunities FOR SELECT USING (true);
CREATE POLICY "Scholarships are modifiable by authenticated users" ON scholarship_opportunities FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- 10. INITIAL DATA SEEDING (TIER 1)
-- ==========================================

-- Insert origin countries (10 African countries)
INSERT INTO countries (country_code, name, region, currency_code, currency_symbol, is_origin_country, is_active) VALUES
('NGA', 'Nigeria', 'West Africa', 'NGN', '₦', true, true),
('GHA', 'Ghana', 'West Africa', 'GHS', '₵', true, true),
('KEN', 'Kenya', 'East Africa', 'KES', 'KSh', true, true),
('ZAF', 'South Africa', 'Southern Africa', 'ZAR', 'R', true, true),
('EGY', 'Egypt', 'North Africa', 'EGP', 'E£', true, true),
('UGA', 'Uganda', 'East Africa', 'UGX', 'USh', true, true),
('TZA', 'Tanzania', 'East Africa', 'TZS', 'TSh', true, true),
('RWA', 'Rwanda', 'East Africa', 'RWF', 'FRw', true, true),
('ETH', 'Ethiopia', 'East Africa', 'ETB', 'Br', true, true),
('MAR', 'Morocco', 'North Africa', 'MAD', 'DH', true, true);

-- Insert destination countries (5 major study destinations)
INSERT INTO countries (country_code, name, region, currency_code, currency_symbol, is_origin_country, is_active, 
  avg_living_cost_monthly_usd, visa_fee_usd, visa_processing_days, work_permit_hours_weekly, post_study_work_duration) VALUES
('USA', 'United States', 'North America', 'USD', '$', false, true, 1500, 350, 60, 20, '12-36 months'),
('CAN', 'Canada', 'North America', 'CAD', 'C$', false, true, 1200, 150, 42, 20, 'up to 3 years'),
('GBR', 'United Kingdom', 'Europe', 'GBP', '£', false, true, 1300, 400, 21, 20, '2-4 years'),
('DEU', 'Germany', 'Europe', 'EUR', '€', false, true, 900, 75, 15, 20, '18 months'),
('AUS', 'Australia', 'Oceania', 'AUD', 'A$', false, true, 1400, 620, 28, 20, '2-4 years');

-- Insert major cities (20 cities across destination countries)
INSERT INTO cities (name, country_code, tier, currency_code, accommodation_min, accommodation_max, food_monthly, transport_monthly, utilities_monthly, entertainment_monthly, public_transport_quality, student_friendly_rating) VALUES
-- US Cities
('New York', 'USA', 'major', 'USD', 1200, 2500, 500, 150, 200, 300, 'good', 7.5),
('Boston', 'USA', 'major', 'USD', 1000, 2200, 450, 120, 180, 250, 'excellent', 8.0),
('Los Angeles', 'USA', 'major', 'USD', 1100, 2300, 480, 140, 190, 280, 'fair', 7.0),
('Chicago', 'USA', 'major', 'USD', 900, 2000, 420, 110, 170, 220, 'good', 7.8),

-- Canadian Cities
('Toronto', 'CAN', 'major', 'CAD', 800, 1800, 400, 100, 150, 200, 'excellent', 8.5),
('Vancouver', 'CAN', 'major', 'CAD', 900, 2000, 420, 120, 160, 220, 'excellent', 8.2),
('Montreal', 'CAN', 'major', 'CAD', 700, 1600, 380, 90, 140, 180, 'excellent', 8.0),

-- UK Cities
('London', 'GBR', 'major', 'GBP', 1000, 2200, 450, 130, 180, 250, 'excellent', 7.5),
('Manchester', 'GBR', 'mid', 'GBP', 600, 1400, 350, 80, 120, 150, 'good', 7.8),
('Edinburgh', 'GBR', 'mid', 'GBP', 650, 1500, 370, 85, 130, 160, 'good', 8.0),

-- German Cities
('Berlin', 'DEU', 'major', 'EUR', 500, 1200, 300, 70, 100, 120, 'excellent', 8.5),
('Munich', 'DEU', 'major', 'EUR', 600, 1400, 330, 80, 110, 140, 'excellent', 8.2),
('Hamburg', 'DEU', 'mid', 'EUR', 550, 1300, 320, 75, 105, 130, 'good', 8.0),

-- Australian Cities
('Sydney', 'AUS', 'major', 'AUD', 1200, 2500, 500, 140, 200, 300, 'good', 7.8),
('Melbourne', 'AUS', 'major', 'AUD', 1100, 2300, 480, 130, 190, 280, 'good', 8.0),
('Brisbane', 'AUS', 'mid', 'AUD', 900, 2000, 420, 110, 160, 220, 'fair', 7.5),

-- Additional major cities from origin countries
('Lagos', 'NGA', 'major', 'NGN', 500, 1000, 200, 50, 80, 100, 'fair', 6.5),
('Accra', 'GHA', 'major', 'GHS', 400, 800, 180, 45, 70, 90, 'fair', 6.8),
('Nairobi', 'KEN', 'major', 'KES', 350, 700, 160, 40, 60, 80, 'fair', 6.2),
('Cape Town', 'ZAF', 'major', 'ZAR', 600, 1200, 250, 60, 90, 120, 'good', 7.0);

-- Insert initial flight routes (30 key routes from African origins to destinations)
INSERT INTO flight_routes (origin_country_code, destination_country_code, avg_economy_cost, currency_code, data_source, confidence_score, typical_layovers, avg_flight_duration_hours) VALUES
-- Nigeria routes (highest priority)
('NGA', 'USA', 1200, 'USD', 'manual', 85, 1, 12),
('NGA', 'CAN', 1100, 'USD', 'manual', 85, 1, 11),
('NGA', 'GBR', 800, 'USD', 'manual', 90, 0, 6),
('NGA', 'DEU', 750, 'USD', 'manual', 85, 1, 7),
('NGA', 'AUS', 1600, 'USD', 'manual', 80, 1, 18),

-- Ghana routes
('GHA', 'USA', 1000, 'USD', 'manual', 85, 1, 10),
('GHA', 'CAN', 950, 'USD', 'manual', 85, 1, 9),
('GHA', 'GBR', 700, 'USD', 'manual', 90, 0, 6),
('GHA', 'DEU', 650, 'USD', 'manual', 85, 1, 6),
('GHA', 'AUS', 1400, 'USD', 'manual', 80, 1, 16),

-- Kenya routes
('KEN', 'USA', 1300, 'USD', 'manual', 85, 1, 14),
('KEN', 'CAN', 1200, 'USD', 'manual', 85, 1, 13),
('KEN', 'GBR', 600, 'USD', 'manual', 90, 0, 8),
('KEN', 'DEU', 550, 'USD', 'manual', 85, 0, 7),
('KEN', 'AUS', 900, 'USD', 'manual', 85, 0, 11),

-- South Africa routes
('ZAF', 'USA', 1400, 'USD', 'manual', 85, 1, 16),
('ZAF', 'CAN', 1300, 'USD', 'manual', 85, 1, 15),
('ZAF', 'GBR', 700, 'USD', 'manual', 90, 0, 11),
('ZAF', 'DEU', 650, 'USD', 'manual', 85, 0, 10),
('ZAF', 'AUS', 1100, 'USD', 'manual', 85, 0, 12),

-- Egypt routes
('EGY', 'USA', 1000, 'USD', 'manual', 85, 1, 13),
('EGY', 'CAN', 950, 'USD', 'manual', 85, 1, 12),
('EGY', 'GBR', 400, 'USD', 'manual', 90, 0, 5),
('EGY', 'DEU', 350, 'USD', 'manual', 85, 0, 4),
('EGY', 'AUS', 1300, 'USD', 'manual', 80, 1, 15),

-- Additional key routes from other African countries
('UGA', 'GBR', 650, 'USD', 'manual', 85, 0, 8),
('TZA', 'GBR', 700, 'USD', 'manual', 85, 0, 9),
('RWA', 'GBR', 800, 'USD', 'manual', 80, 1, 10),
('ETH', 'GBR', 600, 'USD', 'manual', 85, 0, 7),
('MAR', 'GBR', 300, 'USD', 'manual', 90, 0, 3);

-- Insert initial universities (20 top universities across destination countries)
-- Note: city_id will be populated after cities are inserted (using subqueries)
INSERT INTO universities (name, country_code, city_id, type, website, description, ranking_world, total_students, international_students, acceptance_rate) VALUES
-- US Universities
('Massachusetts Institute of Technology', 'USA', (SELECT id FROM cities WHERE name = 'Boston' AND country_code = 'USA' LIMIT 1), 'Public', 'https://www.mit.edu', 'World-renowned research university specializing in technology and innovation', 1, 11520, 3960, 3.2),
('Stanford University', 'USA', NULL, 'Private', 'https://www.stanford.edu', 'Leading research university in Silicon Valley', 3, 17000, 3600, 3.9),
('Harvard University', 'USA', (SELECT id FROM cities WHERE name = 'Boston' AND country_code = 'USA' LIMIT 1), 'Private', 'https://www.harvard.edu', 'Oldest and most prestigious university in the United States', 4, 23000, 5800, 3.4),
('University of Chicago', 'USA', (SELECT id FROM cities WHERE name = 'Chicago' AND country_code = 'USA' LIMIT 1), 'Private', 'https://www.uchicago.edu', 'Premier research university known for economics and sciences', 10, 17000, 4800, 5.9),

-- Canadian Universities
('University of Toronto', 'CAN', (SELECT id FROM cities WHERE name = 'Toronto' AND country_code = 'CAN' LIMIT 1), 'Public', 'https://www.utoronto.ca', 'Canada''s top university with diverse programs', 18, 95000, 23000, 43.0),
('University of British Columbia', 'CAN', (SELECT id FROM cities WHERE name = 'Vancouver' AND country_code = 'CAN' LIMIT 1), 'Public', 'https://www.ubc.ca', 'Leading research university on Canada''s west coast', 34, 70000, 18000, 52.0),
('McGill University', 'CAN', (SELECT id FROM cities WHERE name = 'Montreal' AND country_code = 'CAN' LIMIT 1), 'Public', 'https://www.mcgill.ca', 'Top Canadian university with strong international reputation', 31, 40000, 12000, 46.0),
('University of Waterloo', 'CAN', NULL, 'Public', 'https://uwaterloo.ca', 'Premier engineering and computer science university', 151, 42000, 8400, 53.0),

-- UK Universities
('University of Oxford', 'GBR', NULL, 'Public', 'https://www.ox.ac.uk', 'Oldest university in the English-speaking world', 2, 24000, 9000, 17.5),
('University of Cambridge', 'GBR', NULL, 'Public', 'https://www.cam.ac.uk', 'Historic collegiate research university', 5, 24000, 8000, 21.0),
('Imperial College London', 'GBR', (SELECT id FROM cities WHERE name = 'London' AND country_code = 'GBR' LIMIT 1), 'Public', 'https://www.imperial.ac.uk', 'Specialized in science, engineering, medicine and business', 6, 19000, 9500, 14.3),
('University College London', 'GBR', (SELECT id FROM cities WHERE name = 'London' AND country_code = 'GBR' LIMIT 1), 'Public', 'https://www.ucl.ac.uk', 'London''s leading multidisciplinary university', 8, 43000, 19000, 48.0),
('University of Edinburgh', 'GBR', (SELECT id FROM cities WHERE name = 'Edinburgh' AND country_code = 'GBR' LIMIT 1), 'Public', 'https://www.ed.ac.uk', 'Scotland''s premier research university', 22, 35000, 14000, 40.0),
('University of Manchester', 'GBR', (SELECT id FROM cities WHERE name = 'Manchester' AND country_code = 'GBR' LIMIT 1), 'Public', 'https://www.manchester.ac.uk', 'Major research university with diverse programs', 27, 40000, 12000, 56.0),

-- German Universities
('Technical University of Munich', 'DEU', (SELECT id FROM cities WHERE name = 'Munich' AND country_code = 'DEU' LIMIT 1), 'Public', 'https://www.tum.de', 'Germany''s top technical university', 37, 45000, 10000, 8.0),
('Ludwig Maximilian University of Munich', 'DEU', (SELECT id FROM cities WHERE name = 'Munich' AND country_code = 'DEU' LIMIT 1), 'Public', 'https://www.lmu.de', 'Leading research university in Munich', 54, 52000, 8000, 17.0),
('Heidelberg University', 'DEU', NULL, 'Public', 'https://www.uni-heidelberg.de', 'Germany''s oldest university', 42, 30000, 6000, 19.0),

-- Australian Universities
('University of Melbourne', 'AUS', (SELECT id FROM cities WHERE name = 'Melbourne' AND country_code = 'AUS' LIMIT 1), 'Public', 'https://www.unimelb.edu.au', 'Australia''s leading university', 14, 51000, 22000, 70.0),
('Australian National University', 'AUS', NULL, 'Public', 'https://www.anu.edu.au', 'National research university in Canberra', 30, 25000, 7000, 35.0),
('University of Sydney', 'AUS', (SELECT id FROM cities WHERE name = 'Sydney' AND country_code = 'AUS' LIMIT 1), 'Public', 'https://www.sydney.edu.au', 'Historic sandstone university in Sydney', 19, 73000, 27000, 65.0);

-- ==========================================
-- 11. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ==========================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_guides_updated_at BEFORE UPDATE ON application_guides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scholarship_opportunities_updated_at BEFORE UPDATE ON scholarship_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 12. COMMENTS FOR CLARITY
-- ==========================================

COMMENT ON TABLE countries IS 'Countries table supporting both origin (African) and destination countries with visa, cost, and general information';
COMMENT ON TABLE cities IS 'Cities with living cost breakdowns and quality metrics for cost calculator integration';
COMMENT ON TABLE universities IS 'University details with rankings, student info, and location references';
COMMENT ON TABLE flight_routes IS 'Flight cost data with API-ready architecture for future integration (currently manual data)';
COMMENT ON TABLE application_guides IS 'Step-by-step application guides specific to universities';
COMMENT ON TABLE scholarship_opportunities IS 'Scholarship and funding opportunities by university and country';

-- Add column comments for important fields
COMMENT ON COLUMN flight_routes.data_source IS 'Source of flight data: manual (current), future API integrations';
COMMENT ON COLUMN flight_routes.confidence_score IS 'Confidence in data accuracy (0-100)';
COMMENT ON COLUMN countries.is_origin_country IS 'True for African countries, false for study destinations';
COMMENT ON COLUMN cities.tier IS 'City size tier: major (100k+ students), mid (10k-100k), small (<10k)';
COMMENT ON COLUMN universities.acceptance_rate IS 'University acceptance rate as percentage';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Akada Phase 2 Database Schema Migration completed successfully!';
    RAISE NOTICE 'Created 6 new tables with proper indexes and RLS policies';
    RAISE NOTICE 'Seeded 15 countries (10 origin + 5 destination), 20 cities, and 20 universities';
    RAISE NOTICE 'Added 30 flight routes across major African origin to destination pairs';
    RAISE NOTICE 'Enhanced programs table with university_id and city_id foreign keys';
END $$;


