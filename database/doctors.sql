
-- Drop existing table if exists
DROP TABLE IF EXISTS doctors CASCADE;

-- Create doctors table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    specialty_id UUID REFERENCES specialties(id),
    qualification VARCHAR(255),
    experience_years INTEGER,
    avatar_url TEXT,
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    consultation_fee INTEGER,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX idx_doctors_specialty ON doctors(specialty_id);
CREATE INDEX idx_doctors_rating ON doctors(rating);

-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view doctors" ON doctors
    FOR SELECT
    USING (true);

CREATE POLICY "Admin can manage doctors" ON doctors
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- Grant permissions
GRANT SELECT ON doctors TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON doctors TO authenticated;

-- Insert sample doctors for Apollo Hospitals
INSERT INTO doctors (
    name,
    hospital_id,
    specialty_id,
    qualification,
    experience_years,
    avatar_url,
    rating,
    consultation_fee
)
SELECT 
    'Dr. Rahul Sharma',
    h.id,
    s.id,
    'MBBS, MD (Cardiology)',
    15,
    'https://example.com/doctor1.jpg',
    4.8,
    1500
FROM hospitals h
CROSS JOIN specialties s
WHERE h.name = 'Apollo Hospitals'
AND s.name = 'Cardiology';

-- Create timestamp update trigger
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
