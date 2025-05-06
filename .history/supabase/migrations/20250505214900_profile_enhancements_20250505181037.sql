-- Add additional profile fields like phone, address, etc.
-- Migration: profile_enhancements (May 5, 2025)

ALTER TABLE user_profiles
ADD COLUMN phone_number TEXT,
ADD COLUMN address_line1 TEXT,
ADD COLUMN address_line2 TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state_province TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN country TEXT,
ADD COLUMN date_of_birth DATE,
ADD COLUMN bio TEXT;

-- Add comment to remind users these are new fields
COMMENT ON COLUMN user_profiles.phone_number IS 'User phone number';
COMMENT ON COLUMN user_profiles.address_line1 IS 'First line of user address';
COMMENT ON COLUMN user_profiles.address_line2 IS 'Second line of user address (optional)';
COMMENT ON COLUMN user_profiles.city IS 'User city';
COMMENT ON COLUMN user_profiles.state_province IS 'User state or province';
COMMENT ON COLUMN user_profiles.postal_code IS 'User postal or zip code';
COMMENT ON COLUMN user_profiles.country IS 'User country of residence';
COMMENT ON COLUMN user_profiles.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN user_profiles.bio IS 'User biography or personal statement';