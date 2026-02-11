// Database types based on our Supabase schema
export interface User {
  id: string
  name: string
  email: string
  plan: 'basic' | 'professional' | 'premium'
  registration_date: string
  created_at: string
  updated_at: string
  stripe_customer_id?: string | null
  photo_url?: string | null // URL da foto do usuário
  email_confirmed_at?: string | null // Data de confirmação do email
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  color: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category_id: string
  date: string
  payment_method: string
  is_recurring: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
  recurring_end_date?: string | null
  status?: 'pending' | 'completed' | 'overdue' | 'due_soon'
  priority?: 'low' | 'medium' | 'high'
  notes?: string
  created_at: string
  updated_at: string
  category?: Category
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  target_amount: number
  current_amount: number
  target_date: string
  deadline?: string // Data limite para a meta
  category_id?: string
  status: 'active' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' // Prioridade da meta
  created_at: string
  updated_at: string
  category?: Category
}

export interface Investment {
  id: string
  user_id: string
  asset_name: string
  asset_type: 'stocks' | 'fii' | 'etf' | 'fixed_income' | 'crypto' | 'funds' | 'others'
  quantity: number
  avg_price: number
  current_price?: number
  broker?: string
  category_id?: string
  created_at: string
  updated_at: string
  category?: Category
}

export interface InvestmentTransaction {
  id: string
  user_id: string
  investment_id?: string
  operation_type: 'buy' | 'sell'
  quantity: number
  price: number
  total_value: number
  date: string
  broker?: string
  notes?: string
  created_at: string
  investment?: Investment
}

export interface RecurringTransaction {
  id: string
  user_id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category_id: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date?: string | null
  day_of_month?: number | null
  day_of_week?: number | null
  is_active: boolean
  priority?: 'low' | 'medium' | 'high'
  notes?: string
  created_at: string
  updated_at: string
  category?: Category
}

export interface Commitment {
  id: string
  user_id: string
  title: string
  description?: string
  date: string
  time: string
  status: 'pendente' | 'confirmado' | 'cancelado'
  type: 'income' | 'expense' | 'investment' | 'meeting' | 'other'
  amount?: number
  category?: string
  recurring: boolean
  recurring_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  notification_preferences: any
  privacy_settings: any
  created_at: string
  updated_at: string
}

export interface AIInsight {
  id: string
  user_id: string
  type: 'spending_pattern' | 'saving_opportunity' | 'budget_alert' | 'investment_suggestion'
  title: string
  description: string
  confidence_score: number
  data: any // JSON data with insight specifics
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  currency: string
  language: string
  timezone: string
  notifications_enabled: boolean
  email_notifications: boolean
  budget_alerts: boolean
  goal_reminders: boolean
  monthly_reports: boolean
  ai_insights_enabled: boolean
  openai_api_key?: string | null
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  month: string // YYYY-MM format
  category_id: string
  planned_amount: number
  spent_amount: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface Notification {
  id: string
  user_id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  is_read: boolean  // Anteriormente 'read' no schema - migration corrigirá para is_read
  created_at: string
  updated_at: string
  action_url?: string | null
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica'
  created_at: string
  updated_at: string
  resolved_at?: string | null
  admin_notes?: string | null
}

export interface SupportSettings {
  id: string
  user_id?: string
  allow_notifications?: boolean
  preferred_contact?: 'email' | 'phone' | 'both'
  business_hours_only?: boolean
  // Campos adicionais usados na página de suporte
  phones?: string[]
  business_hours?: string
  chat_url?: string
  support_email?: string
  whatsapp?: string
  knowledge_base_url?: string
  created_at: string
  updated_at: string
}

export interface AIUsageRecord {
  id: string
  user_id: string
  plan: 'basic' | 'professional' | 'premium'
  question_count: number
  last_reset_date: string
  last_question_date?: string | null
  created_at: string
  updated_at: string
}

// Utility types
export type DatabaseTables = {
  users: User
  categories: Category
  transactions: Transaction
  goals: Goal
  investments: Investment
  ai_insights: AIInsight
  user_settings: UserSettings
  budgets: Budget
  notifications: Notification
  support_tickets: SupportTicket
  support_settings: SupportSettings
  ai_usage: AIUsageRecord
}

export type TransactionType = Transaction['type']
export type GoalStatus = Goal['status']
export type InvestmentType = Investment['asset_type']
export type NotificationType = Notification['type']
export type UserPlan = User['plan']