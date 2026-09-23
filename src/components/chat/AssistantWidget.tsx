import { useEffect, useRef, useState } from 'react'
import { Bot, Send, X, Sparkles } from 'lucide-react'
import { useAppState } from '../../context/AppStateContext'
import { answerQuestion, assistantWorkspaceGreeting } from '../../utils/assistant'

interface ChatMessage {
  id: number
  role: 'assistant' | 'user'
  text: string
}

let nextId = 1

export function AssistantWidget() {
  const { workspace } = useAppState()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typing, setTyping] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([{ id: nextId++, role: 'assistant', text: assistantWorkspaceGreeting(workspace) }])
  }, [workspace])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((m) => [...m, { id: nextId++, role: 'user', text: trimmed }])
    setInput('')
    setTyping(true)
    window.setTimeout(() => {
      setMessages((m) => [...m, { id: nextId++, role: 'assistant', text: answerQuestion(trimmed, workspace) }])
      setTyping(false)
    }, 450)
  }

  return (
    <>
      <button
        data-tour="assistant-widget"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        className="fixed bottom-5 right-5 z-50 flex items-center justify-center rounded-full bg-brand-600 text-white shadow-2xl transition-transform hover:scale-105 hover:bg-brand-700 active:scale-95"
        style={{ height: 52, width: 52 }}
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5.5 w-5.5" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl dark:border-ink-700 dark:bg-ink-900">
          <div className="flex shrink-0 items-center gap-2.5 border-b border-ink-100 bg-gradient-to-r from-brand-600 to-accent-600 px-4 py-3 text-white dark:border-ink-800">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15"><Bot className="h-4.5 w-4.5" /></div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">Alumnia Assistant</p>
              <p className="truncate text-[11px] text-white/80">Grounded in this workspace's live data</p>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-brand-600 text-white'
                      : 'rounded-bl-sm bg-ink-100 text-ink-800 dark:bg-ink-800 dark:text-ink-100'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-ink-100 px-3.5 py-2.5 dark:bg-ink-800">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400" style={{ animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-ink-100 p-3 dark:border-ink-800">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {['Find an alumnus', 'Upcoming events', 'Open jobs', 'Help'].map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="inline-flex items-center gap-1 rounded-full border border-ink-200 px-2.5 py-1 text-[11px] font-medium text-ink-500 hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-400"
                >
                  <Sparkles className="h-3 w-3" /> {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); send(input) }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about alumni, events, careers…"
                className="h-9 flex-1 rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
              />
              <button type="submit" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
