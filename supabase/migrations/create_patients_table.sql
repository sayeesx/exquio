
-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    phone VARCHAR(15),
    gender VARCHAR(10),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own patient records
CREATE POLICY "Users can view their own patient records"
    ON public.patients
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to create their own patient records
CREATE POLICY "Users can create their own patient records"
    ON public.patients
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to handle patient creation and token booking
CREATE OR REPLACE FUNCTION create_patient_and_book_token(
    p_name VARCHAR,
    p_age INTEGER,
    p_phone VARCHAR,
    p_gender VARCHAR,
    p_doctor_id UUID,
    p_booking_date DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_patient_id UUID;
    v_token_number INTEGER;
    v_token_record RECORD;
BEGIN
    -- Create patient record
    INSERT INTO public.patients (
        name,
        age,
        phone,
        gender,
        user_id
    )
    VALUES (
        p_name,
        p_age,
        p_phone,
        p_gender,
        auth.uid()
    )
    RETURNING id INTO v_patient_id;

    -- Get next token number
    SELECT COALESCE(MAX(token_number), 0) + 1
    INTO v_token_number
    FROM public.tokens
    WHERE doctor_id = p_doctor_id
    AND booking_date = p_booking_date;

    -- Create token record
    INSERT INTO public.tokens (
        doctor_id,
        patient_id,
        token_number,
        booking_date,
        status
    )
    VALUES (
        p_doctor_id,
        v_patient_id,
        v_token_number,
        p_booking_date,
        'waiting'
    )
    RETURNING * INTO v_token_record;

    -- Return combined result
    RETURN json_build_object(
        'patient_id', v_patient_id,
        'token_number', v_token_record.token_number,
        'status', v_token_record.status
    );
END;
$$;
