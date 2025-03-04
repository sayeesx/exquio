-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own patient records" ON public.patients;

-- Create new more permissive policy for inserts
CREATE POLICY "Enable insert for authenticated users"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for selecting records
CREATE POLICY "Enable read access for own records"
ON public.patients
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
3