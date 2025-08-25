'use client'

import { create } from 'zustand'

export type Todo = {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string // ISO date (YYYY-MM-DD)
  notes?: string
  createdAt: number
}

type State = {
  todos: Todo[]
  hydrated: boolean
  hydrate: () => void
  addTodo: (title: string, priority?: Todo['priority'], dueDate?: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  updateTodo: (id: string, title: string) => void
  setPriority: (id: string, p: Todo['priority']) => void
  setDueDate: (id: string, d?: string) => void
  clearCompleted: () => void
  reorder: (id: string, direction: 'up' | 'down') => void
  toggleAll: (completed: boolean) => void
}

const STORAGE_KEY = 'next-todo'

export const useTodoStore = create<State>((set, get) => ({
  todos: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? (JSON.parse(raw) as any[]) : []
      // Migration for older records without new fields
      const data: Todo[] = parsed.map((t, i) => ({
        id: t.id,
        title: t.title,
        completed: !!t.completed,
        priority: (t.priority === 'low' || t.priority === 'high' || t.priority === 'medium') ? t.priority : 'medium',
        dueDate: typeof t.dueDate === 'string' ? t.dueDate : undefined,
        notes: typeof t.notes === 'string' ? t.notes : undefined,
        createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now() - i,
      }))
      set({ todos: data, hydrated: true })
    } catch {
      set({ hydrated: true })
    }
  },
  addTodo: (title, priority = 'medium', dueDate) =>
    set((s) => {
      const next: Todo[] = [
        {
          id: crypto.randomUUID(),
          title,
          completed: false,
          priority,
          dueDate,
          createdAt: Date.now(),
        },
        ...s.todos,
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return { todos: next }
    }),
  toggleTodo: (id) =>
    set((s) => {
      const next = s.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return { todos: next }
    }),
  deleteTodo: (id) =>
    set((s) => {
      const next = s.todos.filter((t) => t.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return { todos: next }
    }),
  updateTodo: (id, title) =>
    set((s) => {
      const next = s.todos.map((t) => (t.id === id ? { ...t, title } : t))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return { todos: next }
    }),
  setPriority: (id, p) =>
    set((s) => {
      const next = s.todos.map((t) => (t.id === id ? { ...t, priority: p } : t))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return { todos: next }
    }),
  setDueDate: (id, d) =>
    set((s) => {
      const next = s.todos.map((t) => (t.id === id ? { ...t, dueDate: d } : t))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return { todos: next }
    }),
  clearCompleted: () =>
    set((s) => {
      const next = s.todos.filter((t) => !t.completed)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return { todos: next }
    }),
  reorder: (id, direction) =>
    set((s) => {
      const idx = s.todos.findIndex((t) => t.id === id)
      if (idx === -1) return { todos: s.todos }
      const next = [...s.todos]
      const swapWith = direction === 'up' ? idx - 1 : idx + 1
      if (swapWith < 0 || swapWith >= next.length) return { todos: s.todos }
      ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return { todos: next }
    }),
  toggleAll: (completed) =>
    set((s) => {
      const next = s.todos.map((t) => ({ ...t, completed }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return { todos: next }
    }),
}))
