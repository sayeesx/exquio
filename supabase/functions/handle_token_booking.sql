-- Function to handle atomic token booking
CREATE OR REPLACE FUNCTION handle_token_booking(doctor_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tokens_available INTEGER;
BEGIN
  -- Get current token count with row lock
  SELECT available_tokens INTO tokens_available
  FROM doctors
  WHERE id = doctor_id
  FOR UPDATE;
  
  -- Check if tokens are available
  IF tokens_available > 0 THEN
    -- Reduce token count
    UPDATE doctors
    SET available_tokens = available_tokens - 1
    WHERE id = doctor_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to reset tokens daily
CREATE OR REPLACE FUNCTION reset_daily_tokens()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE doctors
  SET available_tokens = max_tokens
  WHERE available = true;
END;
$$;

-- Create a cron job to reset tokens daily at midnight
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('0 0 * * *', $$
  SELECT reset_daily_tokens();
$$);
