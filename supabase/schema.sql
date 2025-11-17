-- =====================================================
-- MONCOYFINANCE - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Este schema contém todas as tabelas, índices, políticas RLS,
-- funções e triggers necessários para a aplicação MoncoyFinance
-- =====================================================

-- =====================================================
-- TABELA: users
-- Perfil dos usuários (vinculado a auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'basic' CHECK (plan IN ('basic', 'professional', 'premium')),
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  stripe_customer_id VARCHAR(255) UNIQUE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: user_settings
-- Configurações personalizadas do usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(10) DEFAULT 'BRL',
  language VARCHAR(10) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  budget_alerts BOOLEAN DEFAULT TRUE,
  goal_reminders BOOLEAN DEFAULT TRUE,
  monthly_reports BOOLEAN DEFAULT TRUE,
  ai_insights_enabled BOOLEAN DEFAULT TRUE,
  ai_frequency VARCHAR(50) DEFAULT 'weekly',
  ai_detail_level VARCHAR(50) DEFAULT 'medium',
  openai_api_key VARCHAR(255),
  theme VARCHAR(50) DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: categories
-- Categorias para transações, metas e investimentos
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'goal')),
  color VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- =====================================================
-- TABELA: transactions
-- Transações financeiras (receitas e despesas)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  payment_method VARCHAR(50),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(50) CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  recurring_end_date DATE,
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'overdue', 'due_soon')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  receipt_url TEXT,
  merchant VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: recurring_transactions
-- Transações recorrentes (automáticas)
-- =====================================================
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  is_active BOOLEAN DEFAULT TRUE,
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: goals
-- Metas financeiras do usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) DEFAULT 0,
  target_date DATE NOT NULL,
  deadline DATE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: investments
-- Investimentos do usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('stocks', 'fii', 'etf', 'fixed_income', 'crypto', 'funds', 'others')),
  quantity NUMERIC(15, 4) NOT NULL,
  avg_price NUMERIC(15, 2) NOT NULL,
  current_price NUMERIC(15, 2),
  broker VARCHAR(255),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: investment_transactions
-- Histórico de operações de investimentos
-- =====================================================
CREATE TABLE IF NOT EXISTS investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('buy', 'sell')),
  quantity NUMERIC(15, 4) NOT NULL,
  price NUMERIC(15, 2) NOT NULL,
  total_value NUMERIC(15, 2) NOT NULL,
  date DATE NOT NULL,
  broker VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: budgets
-- Orçamentos mensais por categoria
-- =====================================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  planned_amount NUMERIC(15, 2) NOT NULL,
  spent_amount NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, category_id)
);

-- =====================================================
-- TABELA: commitments
-- Compromissos financeiros agendados
-- =====================================================
CREATE TABLE IF NOT EXISTS commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'meeting', 'other')),
  amount NUMERIC(15, 2),
  category VARCHAR(100),
  recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern VARCHAR(50) CHECK (recurring_pattern IN ('daily', 'weekly', 'monthly', 'yearly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: notifications
-- Notificações do sistema para o usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: ai_insights
-- Insights gerados pela IA
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL CHECK (type IN ('spending_pattern', 'saving_opportunity', 'budget_alert', 'investment_suggestion')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  confidence_score NUMERIC(3, 2) CHECK (confidence_score BETWEEN 0 AND 1),
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  potential_savings NUMERIC(15, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: ai_usage
-- Controle de uso da IA por plano
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL CHECK (plan IN ('basic', 'professional', 'premium')),
  question_count INTEGER DEFAULT 0,
  last_reset_date TIMESTAMPTZ DEFAULT NOW(),
  last_question_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: support_tickets
-- Tickets de suporte abertos pelos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(50) DEFAULT 'Média' CHECK (priority IN ('Baixa', 'Média', 'Alta', 'Crítica')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  admin_notes TEXT
);

-- =====================================================
-- TABELA: support_settings
-- Configurações de suporte
-- =====================================================
CREATE TABLE IF NOT EXISTS support_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  allow_notifications BOOLEAN DEFAULT TRUE,
  preferred_contact VARCHAR(50) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'both')),
  business_hours_only BOOLEAN DEFAULT FALSE,
  phones TEXT[],
  business_hours TEXT,
  chat_url TEXT,
  support_email VARCHAR(255),
  whatsapp VARCHAR(50),
  knowledge_base_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: bank_accounts
-- Contas bancárias do usuário (opcional)
-- =====================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(100),
  account_number VARCHAR(255),
  balance NUMERIC(15, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);

CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_user_id ON investment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_investment_id ON investment_transactions(investment_id);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_active ON recurring_transactions(is_active);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_commitments_user_date ON commitments(user_id, date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_read ON ai_insights(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_status ON support_tickets(user_id, status);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS - USERS
-- =====================================================
DROP POLICY IF EXISTS "Allow users to access their own data" ON users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON users;
DROP POLICY IF EXISTS "Allow users to insert their own data" ON users;

CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- POLÍTICAS RLS - OUTRAS TABELAS
-- =====================================================
DROP POLICY IF EXISTS "Allow users to access their own settings" ON user_settings;
CREATE POLICY "user_settings_all_own" ON user_settings FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to access their own categories" ON categories;
CREATE POLICY "categories_all_own" ON categories FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to access their own transactions" ON transactions;
CREATE POLICY "transactions_all_own" ON transactions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to access their own recurring transactions" ON recurring_transactions;
CREATE POLICY "recurring_transactions_all_own" ON recurring_transactions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to access their own goals" ON goals;
CREATE POLICY "goals_all_own" ON goals FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to access their own investments" ON investments;
CREATE POLICY "investments_all_own" ON investments FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to access their own investment transactions" ON investment_transactions;
CREATE POLICY "investment_transactions_all_own" ON investment_transactions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to access their own bank accounts" ON bank_accounts;
CREATE POLICY "bank_accounts_all_own" ON bank_accounts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to access their own AI insights" ON ai_insights;
CREATE POLICY "ai_insights_all_own" ON ai_insights FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "budgets_all_own" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "commitments_all_own" ON commitments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notifications_all_own" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "ai_usage_all_own" ON ai_usage FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "support_tickets_all_own" ON support_tickets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "support_settings_all_own" ON support_settings FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÃO: handle_new_user
-- Cria perfil e configurações quando novo usuário se registra
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar perfil em public.users
  INSERT INTO public.users (id, name, email, plan, registration_date, photo_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'plan', 'basic'),
    NEW.created_at,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Criar configurações padrão em public.user_settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Criar registro de uso de IA
  INSERT INTO public.ai_usage (user_id, plan)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'plan', 'basic'))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: on_auth_user_created
-- Dispara handle_new_user quando usuário é criado
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNÇÃO: update_updated_at_column
-- Atualiza automaticamente o campo updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS: updated_at automático
-- =====================================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commitments_updated_at BEFORE UPDATE ON commitments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_usage_updated_at BEFORE UPDATE ON ai_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_settings_updated_at BEFORE UPDATE ON support_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERIR CATEGORIAS PADRÃO (OPCIONAL)
-- Você pode descomentar para criar categorias padrão
-- =====================================================
-- Exemplo: INSERT INTO categories (user_id, name, type, color)
-- VALUES ('<user_id>', 'Salário', 'income', 'green');

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
