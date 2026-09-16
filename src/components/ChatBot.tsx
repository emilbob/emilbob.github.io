import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import gsap from 'gsap'
import MagneticEl from './MagneticEl'
import { scramble } from '../utils/scramble'

/**
 * Portfolio assistant. Talks to the OpenRouter proxy in bot-api/ — never to
 * OpenRouter directly, because this bundle is public and a key in it would be too.
 * Renders nothing when VITE_BOT_API_URL is unset, so the site stays clean until
 * the proxy is deployed.
 */

const API_URL = import.meta.env.VITE_BOT_API_URL

const SUGGESTIONS = [
  'What has Emil built with Rust?',
  'Tell me about his ZK work',
  'Is he available for hire?',
  'What does he use for WebGL?',
]

type Msg = { role: 'user' | 'assistant'; content: string }

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const titleRef = useRef<HTMLSpanElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const pinnedToBottom = useRef(true)

  // Open / close
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    gsap.to(panel, {
      autoAlpha: open ? 1 : 0,
      y: open ? 0 : 16,
      duration: open ? 0.5 : 0.3,
      ease: open ? 'expo.out' : 'expo.in',
    })

    if (open) {
      if (titleRef.current) scramble(titleRef.current, '> ask_emil.sh', { duration: 500 })
      // Don't steal focus on touch — it yanks the keyboard open before they read anything.
      if (window.matchMedia('(pointer: fine)').matches) {
        setTimeout(() => inputRef.current?.focus(), 350)
      }
    }
  }, [open])

  // Escape closes
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Abort any in-flight request when the widget goes away
  useEffect(() => () => abortRef.current?.abort(), [])

  // Follow the stream, unless the visitor has scrolled up to read something
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && pinnedToBottom.current) el.scrollTop = el.scrollHeight
  }, [messages])

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    pinnedToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  async function send(text: string) {
    const question = text.trim()
    if (!question || streaming || !API_URL) return

    const history = [...messages, { role: 'user' as const, content: question }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setError(null)
    setStreaming(true)
    pinnedToBottom.current = true
    if (inputRef.current) inputRef.current.style.height = 'auto'

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const detail = await res.json().catch(() => null)
        throw new Error(detail?.error ?? `Request failed (${res.status}).`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let answer = ''

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        answer += decoder.decode(value, { stream: true })
        setMessages([...history, { role: 'assistant', content: answer }])
      }

      if (!answer.trim()) {
        throw new Error('The model returned an empty response.')
      }
    } catch (err) {
      const e = err as Error
      if (e.name === 'AbortError') return
      // fetch() rejects with a bare TypeError when the network or the proxy is
      // unreachable — "Failed to fetch" means nothing to a visitor.
      setError(
        e instanceof TypeError
          ? "Couldn't reach the assistant. Try again in a moment."
          : e.message,
      )
      // Drop the empty assistant bubble — the error line replaces it.
      setMessages(history)
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  const onKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send(input)
    }
  }

  // Grow the input up to ~4 lines, then let it scroll
  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    setInput(el.value)
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  }

  if (!API_URL) return null

  return (
    <>
      {/* Launcher — bottom-left, opposite BackToTop. Icon + "Chat" reads as a
          chat widget at a glance; the plain "• Ask" pill it replaced didn't. */}
      <MagneticEl className="fixed bottom-8 left-8 z-[60]" strength={0.3} range={70}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close chat' : "Chat with Emil's assistant"}
          className="flex items-center gap-3 font-mono text-lg tracking-[0.2em] uppercase border px-5 py-3.5 transition-colors duration-200 border-smoke bg-void/90 backdrop-blur-md text-mist hover:border-electric hover:text-electric"
        >
          <span className="relative flex items-center justify-center w-[24px] h-[24px] shrink-0">
            {open ? (
              <span className="text-xl leading-none">✕</span>
            ) : (
              <>
                {/* Speech-bubble glyph, sharp corners to match the site's zero-radius
                    borders elsewhere — a rounded chat-bubble icon would look imported. */}
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.3}
                  aria-hidden="true"
                >
                  <path d="M4 4H20V15H10L7 19V15H4Z" />
                  <circle cx="8" cy="9.5" r="0.9" fill="currentColor" stroke="none" />
                  <circle cx="12" cy="9.5" r="0.9" fill="currentColor" stroke="none" />
                  <circle cx="16" cy="9.5" r="0.9" fill="currentColor" stroke="none" />
                </svg>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-electric pulse-electric" />
              </>
            )}
          </span>
          <span>{open ? 'Close' : 'Chat'}</span>
        </button>
      </MagneticEl>

      {/* Panel */}
      <div
        ref={panelRef}
        aria-hidden={!open}
        className="fixed z-[60] flex flex-col border border-smoke bg-void/95 backdrop-blur-md bottom-24 left-8 w-[400px] h-[min(560px,65vh)] max-sm:left-4 max-sm:right-4 max-sm:bottom-24 max-sm:w-auto max-sm:h-[min(480px,60vh)]"
        style={{ opacity: 0, visibility: 'hidden' }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-smoke px-4 py-3 shrink-0">
          <span ref={titleRef} className="font-mono text-base text-electric tracking-wider">
            &gt; ________
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="font-mono text-base text-mist hover:text-electric transition-colors duration-200 px-1"
          >
            ✕
          </button>
        </div>

        {/* Transcript — data-lenis-prevent stops Lenis hijacking the wheel here */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          data-lenis-prevent
          className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
        >
          {messages.length === 0 && (
            <div className="flex flex-col gap-4">
              <p className="font-sans text-base text-mist leading-relaxed">
                Ask about Emil's work — projects, stack, experience, availability.
                Answers come from this site's content.
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="text-left font-mono text-2xs text-mist border border-smoke px-3 py-2 hover:border-electric hover:text-electric transition-colors duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <span className="font-mono text-2xs text-mist tracking-[0.25em] uppercase">
                {m.role === 'user' ? '$ you' : '> bot'}
              </span>
              <p
                className={`font-sans text-base leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user' ? 'text-bone' : 'text-ivory'
                }`}
              >
                {m.content}
                {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                  <span className="blink text-electric">▍</span>
                )}
              </p>
            </div>
          ))}

          {error && (
            <p className="font-mono text-2xs text-warm border border-warm/40 px-3 py-2">
              ! {error}
            </p>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-smoke px-4 py-3 shrink-0 flex items-end gap-3">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={streaming}
            placeholder={streaming ? 'thinking…' : 'Ask something…'}
            aria-label="Your question"
            className="flex-1 resize-none bg-transparent font-mono text-base text-ivory placeholder:text-mist/60 outline-none disabled:opacity-50 leading-relaxed"
          />
          <button
            onClick={() => void send(input)}
            disabled={streaming || !input.trim()}
            aria-label="Send"
            className="font-mono text-2xs tracking-[0.2em] uppercase border border-smoke px-3 py-1.5 text-mist transition-colors duration-200 hover:border-electric hover:text-electric disabled:opacity-30 disabled:hover:border-smoke disabled:hover:text-mist"
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
}
