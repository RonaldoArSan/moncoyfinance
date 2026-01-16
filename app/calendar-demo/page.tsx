"use client";

import { useState } from "react";
import { Calendar } from "@/components/calendar";
import { CommitmentsModal } from "@/components/modals/commitments-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import type { Commitment } from "@/types/commitment";

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// Sample commitments data - using dynamic dates relative to today
const sampleCommitments: Commitment[] = [
  {
    id: '1',
    title: 'Reunião com cliente',
    date: getTodayDate(),
    time: '09:00',
    description: 'Apresentação do projeto novo',
    status: 'confirmado',
    category: 'Trabalho',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Consulta médica',
    date: getTodayDate(),
    time: '14:30',
    description: 'Check-up anual',
    status: 'confirmado',
    category: 'Saúde',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Jantar com amigos',
    date: getTodayDate(),
    time: '19:00',
    status: 'pendente',
    category: 'Pessoal',
    priority: 'low'
  },
  {
    id: '4',
    title: 'Reunião de equipe',
    date: '2025-10-16',
    time: '10:00',
    description: 'Sprint planning',
    status: 'confirmado',
    category: 'Trabalho',
    priority: 'high'
  },
  {
    id: '5',
    title: 'Academia',
    date: '2025-10-16',
    time: '18:00',
    status: 'pendente',
    category: 'Saúde',
    priority: 'medium'
  },
  {
    id: '6',
    title: 'Dentista',
    date: '2025-10-18',
    time: '15:00',
    description: 'Limpeza dental',
    status: 'confirmado',
    category: 'Saúde',
    priority: 'medium'
  },
  {
    id: '7',
    title: 'Apresentação do projeto',
    date: '2025-10-20',
    time: '11:00',
    description: 'Apresentação final para stakeholders',
    status: 'pendente',
    category: 'Trabalho',
    priority: 'high'
  },
  {
    id: '8',
    title: 'Evento cancelado',
    date: '2025-10-22',
    time: '16:00',
    status: 'cancelado',
    category: 'Pessoal',
    priority: 'low'
  }
];

export default function CalendarDemoPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCommitments, setSelectedCommitments] = useState<Commitment[]>([]);

  const handleDayClick = (dayData: { date: string; commitments: Commitment[] }) => {
    setSelectedDate(dayData.date);
    setSelectedCommitments(dayData.commitments);
    setModalOpen(true);
  };

  const handleEmptyDayClick = (date: string) => {
    setSelectedDate(date);
    setSelectedCommitments([]);
    setModalOpen(true);
  };

  const handleSelectCommitment = (commitment: Commitment) => {
    alert(`Compromisso selecionado: ${commitment.title}`);
  };

  const handleAddCommitment = () => {
    alert(`Adicionar novo compromisso para ${selectedDate}`);
  };

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Calendário de Compromissos
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gerencie seus compromissos de forma visual e intuitiva
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        {/* Legend */}
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader>
            <CardTitle className={darkMode ? 'text-white' : ''}>Legenda</CardTitle>
            <CardDescription className={darkMode ? 'text-gray-400' : ''}>
              Status dos compromissos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-500"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Confirmado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-500"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Pendente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-500"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Cancelado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-50 border-2 border-blue-300"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Hoje</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardContent className="pt-6">
            <Calendar
              commitments={sampleCommitments}
              darkMode={darkMode}
              onDayClick={handleDayClick}
              onEmptyDayClick={handleEmptyDayClick}
            />
          </CardContent>
        </Card>

        {/* Commitments Modal */}
        <CommitmentsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          date={selectedDate}
          commitments={selectedCommitments}
          onAddCommitment={handleAddCommitment}
          onSelectCommitment={handleSelectCommitment}
        />
      </div>
    </div>
  );
}
