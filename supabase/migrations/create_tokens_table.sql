-- Create tokens table with proper schema
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS token_number SERIAL;
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS booking_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'waiting';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS available_tokens INTEGER DEFAULT 50;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS max_tokens INTEGER DEFAULT 50;

-- Add necessary indices
CREATE INDEX IF NOT EXISTS idx_tokens_doctor_date ON tokens(doctor_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens(status);
