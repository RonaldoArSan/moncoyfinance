"use client"

import type React from "react"
import { useTransactions } from "@/hooks/use-transactions-query"
import { useGoals } from "@/hooks/use-goals-query"
import { useInvestments } from "@/hooks/use-investments-query"

import { Search, Clock, TrendingUp, Target, CreditCard, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import Link from "next/link"

interface SearchResult {
  id: string
  type: "transaction" | "goal" | "investment" | "page"
  title: string
  subtitle?: string
  value?: string
  href: string
  icon: React.ReactNode
}

export function SearchDropdown() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const { transactions } = useTransactions()
  const { goals } = useGoals()
  const { investments } = useInvestments()

  // Monta dados reais para busca
  const searchData: SearchResult[] = [
    ...transactions.map(tx => ({
      id: tx.id,
      type: "transaction" as const,
      title: tx.description,
      subtitle: `${tx.type === "income" ? "Receita" : "Despesa"}${tx.category ? ` • ${tx.category.name}` : ""} • ${new Date(tx.date).toLocaleDateString("pt-BR")}`,
      value: `R$ ${tx.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      href: `/transactions/${tx.id}`,
      icon: <DollarSign className={`h-4 w-4 ${tx.type === "income" ? "text-success-500" : "text-danger-500"}`} />,
    })),
    ...goals.map(goal => ({
      id: goal.id,
      type: "goal" as const,
      title: goal.title,
      subtitle: `Meta • ${(goal.current_amount / goal.target_amount * 100).toFixed(0)}% concluída`,
      value: `R$ ${goal.target_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      href: `/goals/${goal.id}`,
      icon: <Target className="h-4 w-4 text-primary-500" />,
    })),
    ...investments.map(inv => ({
      id: inv.id,
      type: "investment" as const,
      title: inv.asset_name,
      subtitle: `Investimento • ${inv.asset_type}${inv.broker ? ` • ${inv.broker}` : ""}`,
      value: inv.current_price ? `R$ ${inv.current_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : undefined,
      href: `/investments/${inv.id}`,
      icon: <TrendingUp className="h-4 w-4 text-success-500" />,
    })),
    {
      id: "reports",
      type: "page" as const,
      title: "Relatórios",
      subtitle: "Análises financeiras",
      href: "/reports",
      icon: <CreditCard className="h-4 w-4 text-secondary-500" />,
    },
  ]

  const recentSearches = [
    "Transações de dezembro",
    "Meta de emergência",
    "Investimentos em ações",
    "Gastos com alimentação",
  ]

  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchData.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(query.toLowerCase()),
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }, [query])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações, metas..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96" align="start">
        {query.length === 0 ? (
          <>
            <DropdownMenuLabel>Buscas Recentes</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {recentSearches.map((search, index) => (
              <DropdownMenuItem key={index} className="cursor-pointer">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{search}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Acesso Rápido</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/transactions" className="cursor-pointer">
                <DollarSign className="h-4 w-4 mr-2" />
                Todas as Transações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/goals" className="cursor-pointer">
                <Target className="h-4 w-4 mr-2" />
                Minhas Metas
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/investments" className="cursor-pointer">
                <TrendingUp className="h-4 w-4 mr-2" />
                Investimentos
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>
              Resultados para "{query}" ({results.length})
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">Nenhum resultado encontrado</div>
            ) : (
              results.map((result) => (
                <DropdownMenuItem key={result.id} asChild>
                  <Link href={result.href} className="cursor-pointer">
                    <div className="flex items-center space-x-3 w-full">
                      {result.icon}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{result.title}</p>
                          {result.value && <span className="text-sm font-medium">{result.value}</span>}
                        </div>
                        {result.subtitle && <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.type === "transaction"
                          ? "Transação"
                          : result.type === "goal"
                            ? "Meta"
                            : result.type === "investment"
                              ? "Investimento"
                              : "Página"}
                      </Badge>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
