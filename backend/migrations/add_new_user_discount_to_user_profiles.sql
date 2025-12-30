-- Add new_user_discount_used field to user_profiles table
-- This tracks if a user has already used their first-order discount

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS new_user_discount_used BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.new_user_discount_used IS 'Tracks if the user has used their new user discount coupon on their first order';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_new_user_discount_used ON user_profiles(new_user_discount_used);





