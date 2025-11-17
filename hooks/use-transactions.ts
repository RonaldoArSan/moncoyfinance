import { useState, useEffect } from 'react'
import { transactionsApi, categoriesApi, recurringTransactionsApi } from '@/lib/api'
import type { Transaction, Category, RecurringTransaction } from '@/lib/supabase'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const data = await transactionsApi.getTransactions()
      setTransactions(data)
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const createTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🔵 Hook: Chamando API para criar transação...')
      const newTransaction = await transactionsApi.createTransaction(transaction)
      console.log('🔵 Hook: Transação criada, atualizando estado local...')
      setTransactions(prev => [newTransaction, ...prev])
      console.log('🔵 Hook: Estado atualizado com sucesso!')
      return newTransaction
    } catch (error) {
      console.error('❌ Hook: Erro ao criar transação:', error)
      throw error
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      await transactionsApi.deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Erro ao deletar transação:', error)
      throw error
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'category'>>) => {
    try {
      const updatedTransaction = await transactionsApi.updateTransaction(id, updates)
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t))
      return updatedTransaction
    } catch (error) {
      console.error('Erro ao atualizar transação:', error)
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message?: string }).message
        : 'Erro desconhecido'
      alert(`Erro ao atualizar transação: ${errorMessage}`)
      throw error
    }
  }

  const loadRecurringTransactions = async () => {
    try {
      const data = await recurringTransactionsApi.getRecurringTransactions()
      setRecurringTransactions(data)
    } catch (error) {
      console.error('Erro ao carregar transações recorrentes:', error)
    }
  }

  const createRecurringTransaction = async (transaction: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newRecurring = await recurringTransactionsApi.createRecurringTransaction(transaction)
      setRecurringTransactions(prev => [newRecurring, ...prev])
      return newRecurring
    } catch (error) {
      console.error('Erro ao criar transação recorrente:', error)
      throw error
    }
  }

  const generateRecurringTransactions = async (month: number, year: number) => {
    try {
      const generated = await recurringTransactionsApi.generateRecurringTransactions(month, year)
      if (generated.length > 0) {
        setTransactions(prev => [...generated, ...prev])
      }
      return generated
    } catch (error) {
      console.error('Erro ao gerar transações recorrentes:', error)
      throw error
    }
  }

  useEffect(() => {
    loadTransactions()
    loadCategories()
    loadRecurringTransactions()
  }, [])

  return {
    transactions,
    categories,
    recurringTransactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createRecurringTransaction,
    generateRecurringTransactions,
    refreshTransactions: loadTransactions,
    refreshCategories: loadCategories,
    refreshRecurringTransactions: loadRecurringTransactions
  }
}