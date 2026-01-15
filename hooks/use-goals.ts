import { useState, useEffect } from 'react'
import { goalsApi, categoriesApi } from '@/lib/api'
import { logger } from '@/lib/logger'
import { useAuth } from '@/components/auth-provider'
import type { Goal, Category } from '@/lib/supabase'

export function useGoals() {
  const { userProfile } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const loadGoals = async () => {
    try {
      setLoading(true)
      const data = await goalsApi.getGoals(userProfile?.id)
      setGoals(data)
    } catch (error) {
      logger.error('Erro ao carregar metas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getCategories('goal', userProfile?.id)
      setCategories(data)
    } catch (error) {
      logger.error('Erro ao carregar categorias:', error)
    }
  }

  const createGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newGoal = await goalsApi.createGoal(goal, userProfile?.id)
      setGoals(prev => [newGoal, ...prev])
      return newGoal
    } catch (error) {
      logger.error('Erro ao criar meta:', error)
      throw error
    }
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const updatedGoal = await goalsApi.updateGoal(id, updates)
      setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g))
      return updatedGoal
    } catch (error) {
      logger.error('Erro ao atualizar meta:', error)
      throw error
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      await goalsApi.deleteGoal(id)
      setGoals(prev => prev.filter(g => g.id !== id))
    } catch (error) {
      console.error('Erro ao deletar meta:', error)
      throw error
    }
  }

  useEffect(() => {
    loadGoals()
    loadCategories()
  }, [])

  return {
    goals,
    categories,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    refreshGoals: loadGoals,
    refreshCategories: loadCategories
  }
}