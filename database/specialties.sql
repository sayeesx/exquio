-- Drop existing tables with CASCADE to handle dependencies
DROP TABLE IF EXISTS hospital_specialties CASCADE;
DROP TABLE IF EXISTS specialties CASCADE;

-- Create specialties table with UUID
CREATE TABLE specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert specialties with UUID
INSERT INTO specialties (name, description, icon_name) VALUES
    ('Cardiology', 'Heart and cardiovascular system', 'heart'),
    ('Neurology', 'Brain, spine, and nervous system', 'brain'),
    ('Orthopedics', 'Bones, joints, and muscles', 'bone'),
    ('Pediatrics', 'Child and adolescent health', 'baby'),
    ('Oncology', 'Cancer diagnosis and treatment', 'virus'),
    ('Dermatology', 'Skin conditions and treatments', 'medical-bag'),
    ('Gynecology', 'Women''s reproductive health', 'human-female'),
    ('ENT', 'Ear, nose, and throat', 'ear-hearing'),
    ('Ophthalmology', 'Eye care and vision', 'eye'),
    ('Dentistry', 'Oral health and dental care', 'tooth'),
    ('Psychiatry', 'Mental health and behavioral disorders', 'brain'),
    ('Urology', 'Urinary tract and male reproductive system', 'kidney'),
    ('Gastroenterology', 'Digestive system disorders', 'stomach'),
    ('Endocrinology', 'Hormone-related conditions', 'medical-bag'),
    ('Pulmonology', 'Respiratory system', 'lungs');

-- Enable RLS
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can view specialties" ON specialties
    FOR SELECT
    USING (true);

-- Grant permissions
GRANT SELECT ON specialties TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON specialties TO authenticated;
