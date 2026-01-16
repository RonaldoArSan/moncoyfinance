-- Update the handle_new_user function to include plan and openai_key from metadata
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
  );
  
  -- Create default settings in public.user_settings
  INSERT INTO public.user_settings (user_id, openai_api_key)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'openai_key'
  );

  -- Create default categories
  INSERT INTO public.categories (user_id, name, type, color) VALUES
    (NEW.id, 'Salário', 'income', 'green'),
    (NEW.id, 'Freelance', 'income', 'blue'),
    (NEW.id, 'Alimentação', 'expense', 'orange'),
    (NEW.id, 'Transporte', 'expense', 'blue'),
    (NEW.id, 'Emergência', 'goal', 'red'),
    (NEW.id, 'Ações', 'investment', 'green');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;