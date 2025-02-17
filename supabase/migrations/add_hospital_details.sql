
-- Add new columns to hospitals table
ALTER TABLE hospitals
ADD COLUMN facilities text[],
ADD COLUMN specialities text[],
ADD COLUMN doctors_count integer DEFAULT 0,
ADD COLUMN bed_count integer DEFAULT 0,
ADD COLUMN established_year integer,
ADD COLUMN working_hours jsonb DEFAULT '{"weekdays": "9:00 AM - 9:00 PM", "weekends": "9:00 AM - 5:00 PM", "emergency": "24/7"}',
ADD COLUMN insurance_accepted boolean DEFAULT false,
ADD COLUMN parking_available boolean DEFAULT false,
ADD COLUMN ambulance_available boolean DEFAULT false,
ADD COLUMN website_url text,
ADD COLUMN social_media jsonb DEFAULT '{"facebook": null, "instagram": null, "twitter": null}';

-- Update existing hospital with more details (example data)
UPDATE hospitals 
SET 
    facilities = ARRAY['ICU', 'Operation Theatre', 'Emergency Room', 'Laboratory', 'Pharmacy', 'Cafeteria', 'Parking'],
    specialities = ARRAY['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine'],
    doctors_count = 50,
    bed_count = 200,
    established_year = 1995,
    working_hours = '{
        "weekdays": "8:00 AM - 10:00 PM",
        "weekends": "9:00 AM - 6:00 PM",
        "emergency": "24/7"
    }'::jsonb,
    insurance_accepted = true,
    parking_available = true,
    ambulance_available = true,
    website_url = 'https://example-hospital.com',
    social_media = '{
        "facebook": "https://facebook.com/example-hospital",
        "instagram": "https://instagram.com/example-hospital",
        "twitter": "https://twitter.com/example-hospital"
    }'::jsonb
WHERE id = 'your-hospital-id';
