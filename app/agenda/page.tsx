"use client"

import { useMemo, useState } from "react"
import { useTransactions } from "@/hooks/use-transactions"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function AgendaPage() {
  const { transactions, recurringTransactions, loading } = useTransactions()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Monta eventos para o calendário
  const eventsForDate = useMemo(() => {
    if (!selectedDate) return []
    
    const txEvents = transactions.filter(tx => 
      isSameDay(parseISO(tx.date), selectedDate)
    ).map(tx => ({
      id: tx.id,
      title: `${tx.type === 'income' ? 'Entrada' : 'Saída'}: ${tx.description}`,
      type: tx.type,
      amount: tx.amount,
      description: tx.description
    }))
    
    const recEvents = recurringTransactions.filter(rt => 
      isSameDay(parseISO(rt.start_date), selectedDate)
    ).map(rt => ({
      id: rt.id,
      title: `Recorrente: ${rt.description}`,
      type: 'recorrente',
      amount: rt.amount,
      description: rt.description
    }))
    
    return [...txEvents, ...recEvents]
  }, [transactions, recurringTransactions, selectedDate])

  const allEventDates = useMemo(() => {
    const dates = new Set<string>()
    transactions.forEach(tx => dates.add(parseISO(tx.date).toDateString()))
    recurringTransactions.forEach(rt => dates.add(parseISO(rt.start_date).toDateString()))
    return Array.from(dates).map(dateStr => new Date(dateStr))
  }, [transactions, recurringTransactions])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <CardTitle className="text-xl text-blue-700 dark:text-blue-300">
              Agenda Financeira
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {eventsForDate.length} evento{eventsForDate.length !== 1 ? 's' : ''} {selectedDate && format(selectedDate, 'dd/MM/yyyy')}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Calendário */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className="rounded-md border-0 bg-white dark:bg-gray-800"
                modifiers={{
                  hasEvent: allEventDates
                }}
                modifiersStyles={{
                  hasEvent: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    fontWeight: 'bold'
                  }
                }}
              />
            </div>

            {/* Lista de Eventos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
                </h3>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {eventsForDate.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum evento nesta data</p>
                  </div>
                ) : (
                  eventsForDate.map((event) => (
                    <div 
                      key={event.id} 
                      className={`p-4 rounded-lg border-l-4 ${
                        event.type === 'income' 
                          ? 'bg-green-50 border-l-green-500 dark:bg-green-900/20' 
                          : event.type === 'recorrente'
                          ? 'bg-yellow-50 border-l-yellow-500 dark:bg-yellow-900/20'
                          : 'bg-red-50 border-l-red-500 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{event.description}</h4>
                          <p className="text-xs text-muted-foreground">
                            {event.type === 'income' ? 'Entrada' : event.type === 'recorrente' ? 'Recorrente' : 'Saída'}
                          </p>
                        </div>
                        <div className={`text-right ${
                          event.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          <span className="font-semibold">
                            {event.type === 'income' ? '+' : '-'}R$ {event.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}