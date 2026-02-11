-- Add email_confirmed_at column to users table
-- This migration adds the email confirmation tracking field

-- Add column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'email_confirmed_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN email_confirmed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Update existing users with confirmed_at from auth.users
-- This syncs the confirmation status for existing users
UPDATE public.users u
SET email_confirmed_at = au.confirmed_at
FROM auth.users au
WHERE u.id = au.id
AND u.email_confirmed_at IS NULL
AND au.confirmed_at IS NOT NULL;

-- Create or replace the trigger function to include email_confirmed_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile in public.users
  INSERT INTO public.users (id, name, email, plan, email_confirmed_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'plan', 'basic'),
    NEW.confirmed_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email_confirmed_at = EXCLUDED.email_confirmed_at;
  
  -- Create default settings in public.user_settings (if not exists)
  INSERT INTO public.user_settings (user_id, openai_api_key)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'openai_key'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default categories (if not exists)
  INSERT INTO public.categories (user_id, name, type, color) VALUES
    (NEW.id, 'Salário', 'income', 'green'),
    (NEW.id, 'Freelance', 'income', 'blue'),
    (NEW.id, 'Alimentação', 'expense', 'orange'),
    (NEW.id, 'Transporte', 'expense', 'blue'),
    (NEW.id, 'Emergência', 'goal', 'red'),
    (NEW.id, 'Ações', 'investment', 'green')
  ON CONFLICT (user_id, name) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to sync email confirmation from auth.users
-- This can be run periodically to keep confirmation status in sync
CREATE OR REPLACE FUNCTION public.sync_email_confirmation()
RETURNS void AS $$
BEGIN
  UPDATE public.users u
  SET email_confirmed_at = au.confirmed_at
  FROM auth.users au
  WHERE u.id = au.id
  AND (u.email_confirmed_at IS NULL OR u.email_confirmed_at != au.confirmed_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on the new column
COMMENT ON COLUMN public.users.email_confirmed_at IS 'Timestamp when the user confirmed their email address (synced from auth.users.confirmed_at)';
