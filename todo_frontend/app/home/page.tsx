'use client'

import { Plus, Trash2, CheckCircle2, Circle, Pencil, X, Check, ArrowUp, ArrowDown, CalendarDays, Flag, ListChecks } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTodoStore } from '@/lib/store'
import classNames from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'

export default function Page() {
  const { todos, addTodo, toggleTodo, deleteTodo, updateTodo, clearCompleted, hydrate, setPriority, setDueDate, reorder, toggleAll } = useTodoStore()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newDue, setNewDue] = useState<string>('')

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const filtered = useMemo(() => {
    let list = todos
    if (filter === 'active') list = list.filter(t => !t.completed)
    if (filter === 'completed') list = list.filter(t => t.completed)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t => t.title.toLowerCase().includes(q))
    }
    return list
  }, [todos, filter, search])

  const activeCount = useMemo(() => todos.filter(t => !t.completed).length, [todos])
  const completedCount = useMemo(() => todos.filter(t => t.completed).length, [todos])

  return (
    <main className="w-full max-w-full px-2 py-4 sm:px-4 md:py-6">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight heading-gradient sm:text-4xl md:text-5xl">Todo</h1>
        <p className="mt-1.5 text-sm text-slate-600/90 dark:text-slate-300/80 sm:text-base">
          Stay organized with a clean, fast, local-first todo app.
        </p>
      </header>

      <motion.section 
        className="card w-full overflow-hidden p-3 sm:p-4 md:p-6" 
        initial={{ y: 10, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.35 }}
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            const title = input.trim()
            if (!title) return
            addTodo(title, newPriority, newDue || undefined)
            setInput('')
            setNewDue('')
          }}
        >
          {/* Row 1: input + add */}
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 min-w-0 px-4 py-3 text-base bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
            />
            <button
              type="submit"
              className="p-3 text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
              aria-label="Add task"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          {/* Row 2: quick options */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="input"
              aria-label="Priority"
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <input
              type="date"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              className="input"
              aria-label="Due date"
            />
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks..."
                    className="input ps-9"
                  />
                  <ListChecks className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Filters */}
        <div className="mt-4">
          <div className="inline-flex rounded-xl p-1 bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-sm">
              <div className="flex flex-1 space-x-1 overflow-x-auto pb-1">
                <FilterButton current={filter} setFilter={setFilter} value="all" label="All" />
                <FilterButton current={filter} setFilter={setFilter} value="active" label="Active" />
                <FilterButton current={filter} setFilter={setFilter} value="completed" label="Completed" />
              </div>
              <button
                onClick={clearCompleted}
                disabled={!completedCount}
                className={classNames(
                  'flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl transition-all active:scale-95',
                  'whitespace-nowrap',
                  completedCount
                    ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30'
                    : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                )}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear completed</span>
                <span className="sm:hidden">Clear</span>
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="me-2">{activeCount} remaining • {completedCount} done</span>
            <button className="btn btn-ghost px-2 py-1" onClick={() => toggleAll(true)}>
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Complete all</span>
            </button>
            <button className="btn btn-ghost px-2 py-1" onClick={() => toggleAll(false)}>
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Uncheck all</span>
            </button>
          </div>
        </div>

        <ul className="mt-5 space-y-3">
          {filtered.length === 0 && (
            <li className="text-center text-slate-500 text-sm py-6">No todos yet.</li>
          )}
          <AnimatePresence initial={false}>
          {filtered.map((t) => (
            <motion.li
              layout
              key={t.id}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.5 }}
              className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-3"
            >
              <div className="flex items-center gap-3">
                <motion.button
                  className="rounded-full p-1.5 text-slate-500 hover:text-brand-600"
                  onClick={() => toggleTodo(t.id)}
                  aria-label={t.completed ? 'Mark as active' : 'Mark as completed'}
                  whileTap={{ scale: 0.9 }}
                >
                  {t.completed ? <CheckCircle2 className="h-6 w-6 text-brand-600" /> : <Circle className="h-6 w-6" />}
                </motion.button>

                {editingId === t.id ? (
                  <EditInline
                    initial={t.title}
                    onCancel={() => setEditingId(null)}
                    onSave={(val) => {
                      updateTodo(t.id, val)
                      setEditingId(null)
                    }}
                  />
                ) : (
                  <span className={classNames('flex-1 text-[15px]', t.completed && 'line-through text-slate-400')}>{t.title}</span>
                )}

                <div className="ms-auto flex items-center gap-1">
                  <motion.button whileTap={{ scale: 0.95 }} className="btn btn-ghost px-2 py-1" onClick={() => setEditingId(t.id)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} className="btn btn-ghost px-2 py-1" onClick={() => reorder(t.id, 'up')} title="Move up" aria-label="Move up">
                    <ArrowUp className="h-4 w-4" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} className="btn btn-ghost px-2 py-1" onClick={() => reorder(t.id, 'down')} title="Move down" aria-label="Move down">
                    <ArrowDown className="h-4 w-4" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} className="btn btn-ghost px-2 py-1" onClick={() => deleteTodo(t.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <PriorityBadge p={t.priority} />
                {t.dueDate && (
                  <div className={classNames('inline-flex items-center gap-1 px-2 py-1 rounded-full border', isOverdue(t.dueDate, t.completed) ? 'border-red-300 text-red-600 dark:text-red-400 dark:border-red-800' : 'border-slate-200 dark:border-slate-700 text-slate-500')}>
                    <CalendarDays className="h-3 w-3" /> {t.dueDate}
                  </div>
                )}
                <select
                  className="input text-xs max-w-[140px] ms-auto"
                  value={t.priority}
                  onChange={(e) => setPriority(t.id, e.target.value as any)}
                  aria-label="Set priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="date"
                  className="input text-xs max-w-[160px]"
                  value={t.dueDate || ''}
                  onChange={(e) => setDueDate(t.id, e.target.value || undefined)}
                />
              </div>
            </motion.li>
          ))}
          </AnimatePresence>
        </ul>
      </motion.section>

      <footer className="mt-8 text-center text-xs text-slate-400">
        Built with Next.js, Tailwind CSS, and Zustand.
      </footer>
    </main>
  )
}

function FilterButton({ current, setFilter, value, label }: {
  current: 'all' | 'active' | 'completed'
  setFilter: (v: 'all' | 'active' | 'completed') => void
  value: 'all' | 'active' | 'completed'
  label: string
}) {
  return (
    <button
      onClick={() => setFilter(value)}
      className={classNames(
        'px-3 py-2 rounded-xl transition-all active:scale-95 min-w-[60px] text-center',
        'text-sm sm:text-base',
        current === value
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-medium'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
      )}
    >
      {label}
    </button>
  )
}

function EditInline({ initial, onCancel, onSave }: {
  initial: string
  onCancel: () => void
  onSave: (val: string) => void
}) {
  const [value, setValue] = useState(initial)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  return (
    <div className="flex items-center w-full gap-2 px-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave(value)
          if (e.key === 'Escape') onCancel()
        }}
        className="flex-1 px-4 py-3 text-base bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
      />
      <div className="flex gap-1">
        <button
          onClick={() => onSave(value)}
          className="p-2 text-green-600 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 active:scale-95"
          aria-label="Save"
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          onClick={onCancel}
          className="p-2 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function PriorityBadge({ p }: { p: 'low' | 'medium' | 'high' }) {
  const map = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  } as const
  const label = p[0].toUpperCase() + p.slice(1)
  return (
    <span className={classNames('inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs', map[p])}>
      <Flag className="h-3 w-3" /> {label}
    </span>
  )
}

function isOverdue(date: string, completed: boolean) {
  if (!date || completed) return false
  try {
    const today = new Date()
    const d = new Date(date + 'T23:59:59')
    return d.getTime() < today.getTime()
  } catch {
    return false
  }
}
