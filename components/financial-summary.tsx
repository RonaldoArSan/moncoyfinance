"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useFinancialSummaryQuery } from "@/hooks/use-financial-summary-query"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

export function FinancialSummary() {
  const summary = useFinancialSummaryQuery()

  if (summary.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <a href="/transactions?filter=receitas&periodo=todos_os_periodos" className="block">
        <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">
              Receitas
            </CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary.totalIncome)}
            </div>
            <p className="text-xs text-green-600/80 dark:text-green-400/80 flex items-center mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Total do período
            </p>
          </CardContent>
        </Card>
      </a>

      <a
        href="/transactions?filter=despesas&periodo=todos_os_periodos"
        className="block"
      >
        <Card className="border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300">
              Despesas
            </CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalExpenses)}
            </div>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 flex items-center mt-1 font-medium">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              Total do período
            </p>
          </CardContent>
        </Card>
      </a>

      <a href="/investments" className="block">
        <Card className="border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Investimentos
            </CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(summary.totalInvestments)}
            </div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 flex items-center mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Valor atual
            </p>
          </CardContent>
        </Card>
      </a>

      <Card className="border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            Economia
          </CardTitle>
          <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
            <PiggyBank className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(summary.totalSavings)}
          </div>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80 flex items-center mt-1 font-medium">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Metas atingidas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}