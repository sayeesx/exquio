CREATE OR REPLACE FUNCTION create_token(
  p_doctor_id UUID,
  p_patient_id UUID,
  p_booking_date DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token_number INTEGER;
  v_token_record RECORD;
BEGIN
  -- Get next token number atomically
  SELECT COALESCE(MAX(token_number), 0) + 1
  INTO v_token_number
  FROM tokens
  WHERE doctor_id = p_doctor_id
  AND booking_date = p_booking_date;

  -- Create token
  INSERT INTO tokens (
    doctor_id,
    patient_id,
    token_number,
    booking_date,
    status
  )
  VALUES (
    p_doctor_id,
    p_patient_id,
    v_token_number,
    p_booking_date,
    'waiting'
  )
  RETURNING * INTO v_token_record;

  -- Return token details
  RETURN json_build_object(
    'token_number', v_token_record.token_number,
    'status', v_token_record.status
  );
END;
$$;
