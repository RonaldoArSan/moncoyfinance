"use client";
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Commitment } from '@/types/commitment';

interface CalendarProps {
  commitments: Commitment[];
  darkMode: boolean;
  onDayClick: (dayData: {date: string, commitments: Commitment[]}) => void;
  onEmptyDayClick?: (date: string) => void;
}

export const Calendar = ({ commitments, darkMode, onDayClick, onEmptyDayClick }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getCommitmentsForDay = (day: number) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return commitments.filter(c => c.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-4">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between px-2">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className={`p-2 rounded-lg transition-all ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className={`p-2 rounded-lg transition-all ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day names header */}
        {dayNames.map(day => (
          <div 
            key={day} 
            className={`p-3 text-center text-sm font-semibold ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          const dayCommitments = day ? getCommitmentsForDay(day) : [];
          const isToday = day && 
            new Date().getDate() === day && 
            new Date().getMonth() === currentDate.getMonth() && 
            new Date().getFullYear() === currentDate.getFullYear();

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border-2 rounded-xl transition-all ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } ${day ? 'cursor-pointer' : 'cursor-default'} ${
                isToday 
                  ? darkMode 
                    ? 'bg-blue-900 bg-opacity-40 border-blue-500' 
                    : 'bg-blue-50 border-blue-300'
                  : ''
              } ${
                day && (darkMode ? 'hover:bg-gray-800 hover:border-gray-600' : 'hover:bg-gray-50 hover:border-gray-300')
              } ${
                dayCommitments.length > 0 
                  ? darkMode 
                    ? 'shadow-md hover:shadow-lg' 
                    : 'shadow-sm hover:shadow-md'
                  : ''
              }`}
              onClick={() => {
                if (day) {
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  if (dayCommitments.length > 0) {
                    onDayClick({
                      date: dateStr,
                      commitments: dayCommitments
                    });
                  } else if (onEmptyDayClick) {
                    onEmptyDayClick(dateStr);
                  }
                }
              }}
            >
              {day && (
                <>
                  {/* Day number */}
                  <div className={`text-sm font-bold mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  } ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {day}
                  </div>
                  
                  {/* Commitments list */}
                  <div className="space-y-1">
                    {dayCommitments.slice(0, 2).map(commitment => (
                      <div
                        key={commitment.id}
                        className={`text-xs p-1.5 rounded-md cursor-pointer truncate transition-all font-medium ${
                          commitment.status === 'confirmado' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800' 
                            : commitment.status === 'pendente'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                        }`}
                        title={`${commitment.time} - ${commitment.title}`}
                      >
                        {commitment.time} - {commitment.title}
                      </div>
                    ))}
                    {dayCommitments.length > 2 && (
                      <div className={`text-xs px-1.5 py-1 font-medium ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        +{dayCommitments.length - 2} mais
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
