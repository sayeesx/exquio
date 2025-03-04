
-- Enable RLS on tokens table
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own tokens
CREATE POLICY "Users can view their own tokens"
ON public.tokens
FOR SELECT
USING (auth.uid() = patient_id);

-- Allow authenticated users to create tokens
CREATE POLICY "Users can create tokens"
ON public.tokens
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update their own tokens
CREATE POLICY "Users can update their own tokens"
ON public.tokens
FOR UPDATE
USING (auth.uid() = patient_id);
