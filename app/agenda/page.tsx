"use client"

import { useState, useMemo, useCallback } from "react"
import { useTransactions } from "@/hooks/use-transactions-query"
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { parseISO, format, parse, startOfWeek, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"

const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function AgendaPage() {
  const { transactions, recurringTransactions, loading } = useTransactions()

  // Monta eventos para o calendário
  const events = useMemo(() => {
    const txEvents = transactions.map(tx => ({
      id: tx.id,
      title: `${tx.type === 'income' ? 'Entrada' : 'Saída'}: ${tx.description}`,
      start: parseISO(tx.date),
      end: parseISO(tx.date),
      allDay: true,
      resource: { type: tx.type, amount: tx.amount }
    }))
    const recEvents = recurringTransactions.map(rt => ({
      id: rt.id,
      title: `Recorrente: ${rt.description}`,
      start: parseISO(rt.start_date),
      end: parseISO(rt.start_date),
      allDay: true,
      resource: { type: 'recorrente', amount: rt.amount }
    }))
    return [...txEvents, ...recEvents]
  }, [transactions, recurringTransactions])

  return (
    <>
      <style jsx global>{`
        /* Estilos básicos do react-big-calendar */
        .rbc-calendar {
          position: relative;
          width: 100%;
          height: 100%;
          background-color: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
          border: none !important;
          font-family: inherit !important;
        }
        
        .rbc-header {
          overflow: hidden;
          flex: 1 0 0%;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0 3px;
          text-align: center;
          vertical-align: middle;
          font-weight: bold;
          font-size: 90%;
          min-height: 0;
          border-bottom: 1px solid hsl(var(--border)) !important;
          background-color: hsl(var(--muted)) !important;
          color: hsl(var(--muted-foreground)) !important;
          padding: 12px 8px !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
        }
        
        .rbc-header + .rbc-header {
          border-left: 1px solid hsl(var(--border));
        }
        
        .rbc-month-view {
          position: relative;
          background-color: hsl(var(--background)) !important;
          border: 1px solid hsl(var(--border));
          display: flex;
          flex-direction: column;
          flex: 1 1;
          width: 100%;
          user-select: none;
          -webkit-user-select: none;
          height: 100%;
        }
        
        .rbc-month-header {
          display: flex;
          flex-direction: row;
        }
        
        .rbc-month-row {
          display: flex;
          position: relative;
          flex-direction: column;
          flex: 1 1 0;
          flex-basis: 0;
          overflow: hidden;
          height: 100%;
          background-color: hsl(var(--background)) !important;
        }
        
        .rbc-row {
          display: flex;
          flex-direction: row;
          background-color: hsl(var(--background)) !important;
        }
        
        .rbc-row-bg {
          display: flex;
          flex-direction: row;
          flex: 1 1 0;
          overflow: hidden;
          background-color: hsl(var(--background)) !important;
        }
        
        .rbc-day-bg {
          flex: 1 1 0;
          background-color: hsl(var(--background)) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        
        .rbc-day-bg + .rbc-day-bg {
          border-left: 0;
        }
        
        .rbc-day-bg:hover {
          background-color: hsl(var(--accent)) !important;
        }
        
        .rbc-today {
          background-color: hsl(var(--primary) / 0.1) !important;
          border: 2px solid hsl(var(--primary)) !important;
        }
        
        .rbc-off-range-bg {
          background-color: hsl(var(--muted) / 0.3) !important;
        }
        
        .rbc-row-content {
          position: relative;
          user-select: none;
          -webkit-user-select: none;
          z-index: 4;
          background-color: hsl(var(--background)) !important;
        }
        
        .rbc-date-cell {
          flex: 1 1 0;
          min-width: 0;
          padding-right: 5px;
          text-align: right;
          background-color: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
          font-weight: 500;
          padding: 8px;
        }
        
        .rbc-date-cell.rbc-off-range {
          color: hsl(var(--muted-foreground));
        }
        
        .rbc-date-cell > a, .rbc-date-cell > a:active, .rbc-date-cell > a:visited {
          color: inherit;
          text-decoration: none;
          font-weight: 600;
        }
        
        .rbc-event {
          border: none !important;
          box-sizing: border-box;
          box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.2);
          border-radius: 5px;
          background-color: #3174ad;
          color: #fff;
          cursor: pointer;
          width: 100%;
          text-align: left;
          padding: 2px 5px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .rbc-slot-selection {
          z-index: 10;
          position: absolute;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          font-size: 75%;
          width: 100%;
          padding: 3px;
        }
        
        .rbc-event-label {
          font-size: 80%;
        }
        
        .rbc-event-overlaps {
          box-shadow: -1px 1px 5px 0px rgba(51, 51, 51, 0.5);
        }
        
        .rbc-event-continues-prior {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        
        .rbc-event-continues-after {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        
        .rbc-event-continues-earlier {
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        }
        
        .rbc-event-continues-later {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        
        .rbc-row-segment {
          padding: 0 1px 1px 1px;
        }
        
        .rbc-selected-cell {
          background-color: rgba(0, 0, 0, 0.1);
        }
        
        .rbc-show-more {
          background-color: rgba(255, 255, 255, 0.3);
          z-index: 4;
          font-weight: bold;
          font-size: 85%;
          height: auto;
          line-height: normal;
          white-space: nowrap;
          color: hsl(var(--foreground));
          background-color: hsl(var(--secondary));
          border: 1px solid hsl(var(--border));
          border-radius: 4px;
          padding: 2px 6px;
          cursor: pointer;
          font-size: 0.75rem !important;
        }
        
        .rbc-show-more:hover {
          background-color: hsl(var(--secondary) / 0.8);
          transform: translateY(-1px);
        }
        
        .rbc-addons-dnd .rbc-addons-dnd-row-body {
          position: relative;
        }
        
        .rbc-addons-dnd .rbc-addons-dnd-drag-row {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        .rbc-toolbar {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .rbc-toolbar .rbc-toolbar-label {
          flex-grow: 1;
          padding: 0 20px;
          text-align: center;
        }
        
        .rbc-toolbar button {
          color: #373a3c;
          display: inline-block;
          margin: 0;
          text-align: center;
          vertical-align: middle;
          background: none;
          background-image: none;
          border: 1px solid #ccc;
          padding: 0.375rem 1rem;
          border-radius: 4px;
          line-height: 1.25;
          cursor: pointer;
        }
        
        .rbc-toolbar button:active, .rbc-toolbar button.rbc-active {
          background-image: none;
          box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
          background-color: #e6e6e6;
          border-color: #adadad;
        }
        
        .rbc-toolbar button:active:hover, .rbc-toolbar button.rbc-active:hover, .rbc-toolbar button:active:focus, .rbc-toolbar button.rbc-active:focus {
          color: #373a3c;
          background-color: #d4d4d4;
          border-color: #8c8c8c;
        }
        
        .rbc-toolbar button:focus {
          color: #373a3c;
          background-color: #e6e6e6;
          border-color: #adadad;
        }
        
        .rbc-toolbar button:hover {
          color: #373a3c;
          background-color: #e6e6e6;
          border-color: #adadad;
        }
        
        .rbc-btn-group {
          display: inline-block;
          white-space: nowrap;
        }
        
        .rbc-btn-group > button:first-child:not(:last-child) {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        
        .rbc-btn-group > button:last-child:not(:first-child) {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        
        .rbc-rtl {
          direction: rtl;
        }
        
        .rbc-off-range {
          color: #999999;
        }
        
        .rbc-header a, .rbc-header a:active, .rbc-header a:visited {
          color: inherit;
          text-decoration: none;
        }
      `}</style>

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
              {events.length} evento{events.length !== 1 ? 's' : ''}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="rounded-xl shadow-lg border bg-background overflow-hidden"
              style={{ height: '75vh', minHeight: 500, maxHeight: '80vh' }}
            >
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={['month', 'week', 'day']}
                messages={{
                  month: 'Mês',
                  week: 'Semana',
                  day: 'Dia',
                  today: 'Hoje',
                  previous: 'Anterior',
                  next: 'Próximo',
                  agenda: 'Agenda',
                  date: 'Data',
                  time: 'Horário',
                  event: 'Evento',
                  showMore: (total: number) => `+ Ver mais (${total})`,
                  work_week: 'Semana útil',
                  allDay: 'Dia inteiro',
                  noEventsInRange: 'Nenhum evento neste período.',
                  weekNumber: 'Nº da semana',
                  dayHeaderFormat: 'dddd, D MMMM',
                  selectRange: 'Selecione o período',
                  select: 'Selecionar',
                  notSelected: 'Não selecionado',
                  back: 'Voltar',
                  forward: 'Avançar',
                  close: 'Fechar',
                  open: 'Abrir',
                  update: 'Atualizar',
                  add: 'Adicionar',
                  delete: 'Excluir',
                  edit: 'Editar',
                  more: 'Mais',
                }}
                culture="pt-BR"
                style={{ flex: 1, width: '100%', height: '100%', background: 'white', borderRadius: 12, boxShadow: '0 2px 16px #0001', border: '1px solid #e5e7eb' }}
                eventPropGetter={(event: any) => {
                  let bg = '#e2e8f0', color = '#222', border = '1px solid #d1d5db'
                  if (event.resource.type === 'income') { bg = '#bbf7d0'; color = '#065f46'; border = '1px solid #34d399' }
                  if (event.resource.type === 'destructive' || event.resource.type === 'expense') { bg = '#fecaca'; color = '#991b1b'; border = '1px solid #f87171' }
                  if (event.resource.type === 'recorrente') { bg = '#fef9c3'; color = '#92400e'; border = '1px solid #fde68a' }
                  return { style: { backgroundColor: bg, color, border, borderRadius: 8, fontWeight: 500, boxShadow: '0 1px 4px #0001', cursor: 'pointer', transition: '0.2s' } }
                }}
                components={{
                  event: ({ event }: { event: any }) => (
                    <div className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                      <span className="block text-sm font-semibold">{event.title}</span>
                      <span className="block text-xs text-gray-500">R$ {event.resource.amount}</span>
                    </div>
                  ),
                  toolbar: (props: any) => (
                    <div className="flex items-center justify-between px-2 py-1 rounded-t-lg border-b bg-sidebar text-sidebar-foreground border-sidebar-border">
                      <div className="flex gap-1">
                        <button
                          className="px-2 py-1 rounded transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
                          onClick={() => props.onNavigate('PREV')}
                        >
                          {(props.messages && props.messages.previous) ? props.messages.previous : 'Anterior'}
                        </button>
                        <button
                          className="px-2 py-1 rounded transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
                          onClick={() => props.onNavigate('TODAY')}
                        >
                          {(props.messages && props.messages.today) ? props.messages.today : 'Hoje'}
                        </button>
                        <button
                          className="px-2 py-1 rounded transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
                          onClick={() => props.onNavigate('NEXT')}
                        >
                          {(props.messages && props.messages.next) ? props.messages.next : 'Próximo'}
                        </button>
                      </div>
                      <span className="font-bold text-lg text-sidebar-primary">{props.label}</span>
                      <div className="flex gap-1">
                        {props.views && props.views.map((view: any) => (
                          <button key={view}
                            className={`px-2 py-1 rounded transition-colors ${props.view === view
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                              }`}
                            onClick={() => props.onView(view)}>
                            {view === 'month' ? 'Mês' : view === 'week' ? 'Semana' : view === 'day' ? 'Dia' : view}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}