export interface Commitment {
  id: string;
  title: string;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:MM
  description?: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
  category?: string;
  priority?: 'high' | 'medium' | 'low';
}
