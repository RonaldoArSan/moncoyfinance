"use client";

import { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format, parse, startOfWeek, getDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { NewTransactionModal } from "@/components/modals/new-transaction-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function AgendaPage() {
  const { transactions, recurringTransactions } = useTransactions();
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] =
    useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const events = useMemo(() => {
    const txEvents = transactions.map((tx) => ({
      id: tx.id,
      title: `${tx.type === "income" ? "+" : "-"} R$ ${tx.amount} - ${
        tx.description
      }`,
      start: parseISO(tx.date),
      end: parseISO(tx.date),
      allDay: true,
      resource: tx,
      type: tx.type,
    }));

    const recEvents = recurringTransactions.map((rt) => ({
      id: rt.id,
      title: `Recorrente: ${rt.description}`,
      start: parseISO(rt.start_date),
      end: parseISO(rt.start_date),
      allDay: true,
      resource: rt,
      type: "recorrente",
    }));

    return [...txEvents, ...recEvents];
  }, [transactions, recurringTransactions]);

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setIsNewTransactionModalOpen(true);
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = "#3174ad";
    if (event.type === "income") backgroundColor = "#10b981"; // green-500
    if (event.type === "expense") backgroundColor = "#ef4444"; // red-500
    if (event.type === "recorrente") backgroundColor = "#f59e0b"; // amber-500

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
        fontSize: "0.8rem",
      },
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <Card className="border-blue-200 dark:border-blue-800 flex-1 flex flex-col shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-xl text-blue-700 dark:text-blue-300">
              Agenda Financeira
            </CardTitle>
          </div>
          <Button
            onClick={() => {
              setSelectedDate(new Date());
              setIsNewTransactionModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={["month", "week", "day", "agenda"]}
            defaultView={Views.MONTH}
            selectable
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventStyleGetter}
            culture="pt-BR"
            messages={{
              next: "Próximo",
              previous: "Anterior",
              today: "Hoje",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              date: "Data",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "Não há eventos neste período.",
            }}
            className="rbc-calendar-custom"
          />
        </CardContent>
      </Card>

      <NewTransactionModal
        open={isNewTransactionModalOpen}
        onOpenChange={setIsNewTransactionModalOpen}
        defaultDate={selectedDate}
      />
    </div>
  );
}
