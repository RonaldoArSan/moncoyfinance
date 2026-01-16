"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertCircle, XCircle, Plus } from "lucide-react";
import type { Commitment } from "@/types/commitment";

interface CommitmentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  commitments: Commitment[];
  onAddCommitment?: () => void;
  onSelectCommitment?: (commitment: Commitment) => void;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const getStatusIcon = (status: Commitment['status']) => {
  switch (status) {
    case 'confirmado':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'pendente':
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    case 'cancelado':
      return <XCircle className="w-4 h-4 text-red-600" />;
  }
};

const getStatusBadgeColor = (status: Commitment['status']) => {
  switch (status) {
    case 'confirmado':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'pendente':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'cancelado':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }
};

const getPriorityBadgeColor = (priority?: Commitment['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'medium':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'low':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const getPriorityLabel = (priority?: Commitment['priority']) => {
  switch (priority) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Média';
    case 'low':
      return 'Baixa';
    default:
      return 'Normal';
  }
};

export function CommitmentsModal({ 
  open, 
  onOpenChange, 
  date, 
  commitments,
  onAddCommitment,
  onSelectCommitment
}: CommitmentsModalProps) {
  // Sort commitments by time
  const sortedCommitments = [...commitments].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-blue-600" />
            Compromissos do Dia
          </DialogTitle>
          <DialogDescription className="text-base capitalize">
            {formatDate(date)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {sortedCommitments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Nenhum compromisso para este dia
              </p>
              {onAddCommitment && (
                <Button onClick={onAddCommitment} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Compromisso
                </Button>
              )}
            </div>
          ) : (
            <>
              {sortedCommitments.map((commitment) => (
                <div
                  key={commitment.id}
                  onClick={() => onSelectCommitment?.(commitment)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    onSelectCommitment ? 'cursor-pointer hover:shadow-md hover:border-blue-300' : ''
                  } dark:border-gray-700 dark:hover:border-blue-600`}
                >
                  {/* Header with time and status */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-lg">{commitment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(commitment.status)}
                      <Badge className={getStatusBadgeColor(commitment.status)}>
                        {commitment.status === 'confirmado' ? 'Confirmado' :
                         commitment.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                      </Badge>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
                    {commitment.title}
                  </h3>

                  {/* Description */}
                  {commitment.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {commitment.description}
                    </p>
                  )}

                  {/* Footer with category and priority */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {commitment.category && (
                      <Badge variant="outline" className="text-xs">
                        {commitment.category}
                      </Badge>
                    )}
                    {commitment.priority && (
                      <Badge className={`text-xs ${getPriorityBadgeColor(commitment.priority)}`}>
                        {getPriorityLabel(commitment.priority)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {onAddCommitment && (
                <Button 
                  onClick={onAddCommitment} 
                  variant="outline" 
                  className="w-full mt-4 border-dashed border-2 hover:border-solid"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Novo Compromisso
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
