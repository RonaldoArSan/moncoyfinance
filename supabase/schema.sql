-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  plan VARCHAR(50) DEFAULT 'basic',
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  ai_frequency VARCHAR(50) DEFAULT 'weekly',
  ai_detail_level VARCHAR(50) DEFAULT 'medium',
  openai_api_key VARCHAR(255),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  theme VARCHAR(50) DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  type VARCHAR(50),
  color VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  amount NUMERIC(10, 2),
  type VARCHAR(50),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  date DATE,
  status VARCHAR(50) CHECK (status IN ('pending', 'completed', 'cancelled', 'overdue', 'due_soon')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  receipt_url TEXT,
  merchant VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  target_amount NUMERIC(10, 2),
  current_amount NUMERIC(10, 2),
  deadline DATE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  priority VARCHAR(50),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create investments table
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  asset_name VARCHAR(255),
  asset_type VARCHAR(50),
  quantity NUMERIC(10, 4),
  avg_price NUMERIC(10, 2),
  current_price NUMERIC(10, 2),
  broker VARCHAR(255),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create investment_transactions table
CREATE TABLE investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  operation_type VARCHAR(50),
  quantity NUMERIC(10, 4),
  price NUMERIC(10, 2),
  total_value NUMERIC(10, 2),
  date DATE,
  broker VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bank_accounts table
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bank_name VARCHAR(255),
  account_type VARCHAR(255),
  account_number VARCHAR(255),
  balance NUMERIC(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_insights table
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(255),
  title TEXT,
  content TEXT,
  priority VARCHAR(50),
  potential_savings NUMERIC(10, 2),
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recurring_transactions table
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  amount NUMERIC(10, 2),
  type VARCHAR(50),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  frequency VARCHAR(50), -- 'monthly', 'weekly', 'yearly'
  start_date DATE,
  end_date DATE,
  day_of_month INTEGER, -- for monthly: 1-31
  day_of_week INTEGER, -- for weekly: 0-6 (Sunday-Saturday)
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow users to access their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow users to insert their own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to access their own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow users to access their own categories" ON categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow users to access their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow users to access their own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow users to access their own investments" ON investments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow users to access their own investment transactions" ON investment_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow users to access their own bank accounts" ON bank_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow users to access their own AI insights" ON ai_insights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow users to access their own recurring transactions" ON recurring_transactions FOR ALL USING (auth.uid() = user_id);

-- Function to create a user profile and settings when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile in public.users
  INSERT INTO public.users (id, name, email, plan, email_confirmed_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    'basic',
    NEW.confirmed_at
  );
  
  -- Create default settings in public.user_settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
