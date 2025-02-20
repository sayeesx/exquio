-- Drop existing table and related objects if they exist with CASCADE
DROP TRIGGER IF EXISTS update_hospitals_updated_at ON hospitals;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS hospitals CASCADE;

-- Create hospitals table with correct schema
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    image_url TEXT,  -- Added this column
    logo_url TEXT,   -- Added this column
    type VARCHAR(100),
    emergency_contact VARCHAR(20),
    email VARCHAR(255),
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    description TEXT,
    facilities TEXT[],
    doctors_count INTEGER DEFAULT 0,
    bed_count INTEGER,
    established_year INTEGER,
    working_hours JSONB,
    insurance_accepted BOOLEAN DEFAULT false,
    parking_available BOOLEAN DEFAULT false,
    ambulance_available BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster searches
CREATE INDEX idx_hospitals_location ON hospitals(location);
CREATE INDEX idx_hospitals_rating ON hospitals(rating);

-- Create timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update trigger
CREATE TRIGGER update_hospitals_updated_at
    BEFORE UPDATE ON hospitals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create junction table with correct UUID references
CREATE TABLE IF NOT EXISTS hospital_specialties (
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    specialty_id UUID REFERENCES specialties(id) ON DELETE CASCADE,
    PRIMARY KEY (hospital_id, specialty_id)
);

-- Enable RLS on junction table
ALTER TABLE hospital_specialties ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can view hospital specialties" ON hospital_specialties
    FOR SELECT
    USING (true);

-- Grant permissions
GRANT SELECT ON hospital_specialties TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON hospital_specialties TO authenticated;

-- Remove the specialities array from hospitals table
ALTER TABLE hospitals DROP COLUMN IF EXISTS specialities;

-- Insert sample data
INSERT INTO hospitals (
    name,
    location,
    image_url,
    logo_url,
    type,
    emergency_contact,
    email,
    rating,
    description,
    facilities,
    doctors_count,
    bed_count,
    established_year,
    working_hours,
    insurance_accepted,
    parking_available,
    ambulance_available
) VALUES (
    'Apollo Hospitals',
    'Bangalore, Karnataka',
    'https://example.com/hospital-image.jpg',
    'https://example.com/hospital-logo.png',
    'Multispeciality Hospital',
    '+91-8012345678',
    'contact@apollohospitals.com',
    4.5,
    'Apollo Hospitals is a world-renowned healthcare institution providing comprehensive medical care with state-of-the-art facilities.',
    ARRAY['ICU', 'Emergency Care', 'Operation Theatres', 'Laboratory', 'Pharmacy', 'Radiology'],
    150,
    500,
    1983,
    '{"weekdays": "9:00 AM - 9:00 PM", "weekends": "9:00 AM - 5:00 PM", "emergency": "24/7"}'::jsonb,
    true,
    true,
    true
),
(
    'Fortis Healthcare',
    'Mumbai, Maharashtra',
    'https://example.com/fortis-image.jpg',
    'https://example.com/fortis-logo.png',
    'Multispeciality Hospital',
    '+91-9023456789',
    'info@fortishealthcare.com',
    4.3,
    'Fortis Healthcare is committed to providing quality healthcare services with cutting-edge medical technology.',
    ARRAY['Emergency Services', 'Diagnostics', 'Blood Bank', 'Rehabilitation', 'Dialysis Center'],
    120,
    400,
    1996,
    '{"weekdays": "8:00 AM - 8:00 PM", "weekends": "9:00 AM - 6:00 PM", "emergency": "24/7"}'::jsonb,
    true,
    true,
    true
);

-- Update existing hospital data to use the junction table
INSERT INTO hospital_specialties (hospital_id, specialty_id)
SELECT h.id, s.id
FROM hospitals h
CROSS JOIN (
    SELECT id, name 
    FROM specialties 
    WHERE name IN ('Cardiology', 'Neurology', 'Orthopedics')
) s;
