'use client'

import { create } from 'zustand'

export type Todo = {
  _id?: string 
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
  toggleTodo: (_id: string | undefined) => void
  deleteTodo: (_id: string | undefined) => void
  updateTodo: (_id: string | undefined, title: string) => void
  setPriority: (_id: string | undefined, p: Todo['priority']) => void
  setDueDate: (_id: string | undefined, d?: string) => void
  clearCompleted: () => void
  reorder: (_id: string | undefined, direction: 'up' | 'down') => void
  toggleAll: (completed: boolean) => void
}

const STORAGE_KEY = 'next-todo'

export const useTodoStore = create<State>((set, get) => ({
  todos: [],
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return
    try { 
      const res = await fetch('http://localhost:4000/todo')
      const data = await res.json()
      const todo = data.data 
      // Migration for older records without new fields
      const todos: Todo[] = todo.map((t: any, i: any) => ({
        id: t.id,
        title: t.title,
        completed: !!t.completed,
        priority: (t.priority === 'low' || t.priority === 'high' || t.priority === 'medium') ? t.priority : 'medium',
        dueDate: typeof t.dueDate === 'string' ? t.dueDate : undefined,
        notes: typeof t.notes === 'string' ? t.notes : undefined,
        createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now() - i,
      }))
      set({ todos: todos, hydrated: true })
    } catch {
      set({ hydrated: true })
    }
  },
  addTodo: (title, priority = 'medium', dueDate) => {
    const newTodo: Todo = { 
      title,
      completed: false,
      priority,
      dueDate,
      createdAt: Date.now(),
    }
    set((s) => ({ todos: [newTodo, ...s.todos] }))
    fetch('http://localhost:4000/todo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTodo),
    })
      .then((response) => response.json())
      .catch((error) => console.error('Error adding todo:', error))
  },
  toggleTodo: (id) =>
    set((s) => {
      const next = s.todos.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t))
      fetch('http://localhost:4000/todo/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(next),
      })
      return { todos: next }
    }),
  deleteTodo: (id) =>
    set((s) => {
      const next = s.todos.filter((t) => t._id !== id)
      fetch('http://localhost:4000/todo/' + id, {
        method: 'DELETE',
      })
      return { todos: next }
    }),
  updateTodo: (id, title) =>
    set((s) => {
      const next = s.todos.map((t) => (t._id === id ? { ...t, title } : t))
      fetch('http://localhost:4000/todo/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(next),
      })
      return { todos: next }
    }),
  setPriority: (id, p) =>
    set((s) => {
      const next = s.todos.map((t) => (t._id === id ? { ...t, priority: p } : t))
      fetch('http://localhost:4000/todo/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(next),
      })
      return { todos: next }
    }),
  setDueDate: (id, d) =>
    set((s) => {
      const next = s.todos.map((t) => (t._id === id ? { ...t, dueDate: d } : t))
      fetch('http://localhost:4000/todo/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(next),
      })
      return { todos: next }
    }),
  clearCompleted: () =>
    set((s) => {
      const next = s.todos.filter((t) => !t.completed)
      fetch('http://localhost:4000/todo', {
        method: 'DELETE',
      })
      return { todos: next }
    }),
  reorder: (id, direction) =>
    set((s) => {
      const idx = s.todos.findIndex((t) => t._id === id)
      if (idx === -1) return { todos: s.todos }
      const next = [...s.todos]
      const swapWith = direction === 'up' ? idx - 1 : idx + 1
      if (swapWith < 0 || swapWith >= next.length) return { todos: s.todos }
      ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
      fetch('http://localhost:4000/todo/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(next),
      })
      return { todos: next }
    }),
  toggleAll: (completed) =>
    set((s) => {
      const next = s.todos.map((t) => ({ ...t, completed }))
      fetch('http://localhost:4000/todo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(next),
      })
      return { todos: next }
    }),
}))
