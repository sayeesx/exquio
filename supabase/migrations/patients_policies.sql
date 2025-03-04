
-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own data
CREATE POLICY "Users can manage their own data"
ON patients
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy for doctors to read patient data
CREATE POLICY "Doctors can view patient data"
ON patients
FOR SELECT
USING (true);  -- Doctors can read all patient data

-- Policy for inserting new patients
CREATE POLICY "Enable insert for authenticated users"
ON patients
FOR INSERT
WITH CHECK (auth.uid() = id);
