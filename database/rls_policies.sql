
-- Enable RLS on hospitals table
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to basic hospital info
CREATE POLICY "Public can view basic hospital info" ON hospitals
    FOR SELECT
    USING (true);  -- Everyone can view hospital data

-- Create policy for admin users to manage hospitals
CREATE POLICY "Admins can manage hospitals" ON hospitals
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create policy to allow hospital staff to update their own hospital
CREATE POLICY "Staff can update their own hospital" ON hospitals
    FOR UPDATE
    USING (
        auth.jwt() ->> 'hospital_id' = id::text
    );

-- Grant appropriate permissions
GRANT SELECT ON hospitals TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON hospitals TO authenticated;
