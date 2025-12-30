-- Add button_target column to hero_slides table if it doesn't exist
-- This fixes the "Could not find the 'button_target' column" error

DO $$
BEGIN
  -- Check if column exists, if not add it
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'hero_slides'
    AND column_name = 'button_target'
  ) THEN
    ALTER TABLE hero_slides
    ADD COLUMN button_target VARCHAR(20) DEFAULT '_self';

    RAISE NOTICE 'Added button_target column to hero_slides table';
  ELSE
    RAISE NOTICE 'button_target column already exists in hero_slides table';
  END IF;
END $$;

-- Update any existing records without button_target to have default value
UPDATE hero_slides
SET button_target = '_self'
WHERE button_target IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN hero_slides.button_target IS 'Link target: _self (same tab) or _blank (new tab)';
