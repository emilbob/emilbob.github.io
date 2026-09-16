import { SYSTEM_PROMPT } from '../lib/context.ts'

export const config = { runtime: 'edge' }

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

/** Change with the OPENROUTER_MODEL env var; slugs are listed at openrouter.ai/models. */
const DEFAULT_MODEL = 'anthropic/claude-haiku-4.5'

const DEFAULT_ORIGINS = [
  'https://emilbob.github.io',
  'http://localhost:5173',
  'http://localhost:4173',
]

// Input caps. These are the real cost ceiling: a request can never be larger
// than MAX_TURNS * MAX_CHARS_PER_MSG of input, whatever the caller sends.
const MAX_TURNS = 24
const MAX_CHARS_PER_MSG = 1500
const MAX_CHARS_TOTAL = 12000
const MAX_OUTPUT_TOKENS = 700

// Per-IP sliding window. Module scope persists for the life of an edge isolate,
// so this throttles a single abusive client but is NOT a global guarantee —
// requests spread across isolates each get their own counter. The hard backstop
// is a credit limit on the OpenRouter key itself. See README.
const RATE_LIMIT = 12
const RATE_WINDOW_MS = 5 * 60 * 1000
const hits = new Map<string, number[]>()

type Role = 'user' | 'assistant'
type Message = { role: Role; content: string }

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  const list = allowed.length > 0 ? allowed : DEFAULT_ORIGINS
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
  if (origin && list.includes(origin)) headers['Access-Control-Allow-Origin'] = origin
  return headers
}

function fail(status: number, message: string, origin: string | null) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key)
    }
  }
  return false
}

/** Accepts only user/assistant turns — the system prompt is never client-supplied. */
function parseMessages(body: unknown): Message[] | string {
  if (typeof body !== 'object' || body === null) return 'Malformed body.'
  const raw = (body as { messages?: unknown }).messages
  if (!Array.isArray(raw)) return 'Expected a "messages" array.'
  if (raw.length === 0) return 'No messages sent.'
  if (raw.length > MAX_TURNS) return 'Conversation too long. Start a new one.'

  const messages: Message[] = []
  let total = 0
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) return 'Malformed message.'
    const { role, content } = item as { role?: unknown; content?: unknown }
    if (role !== 'user' && role !== 'assistant') return 'Unsupported message role.'
    if (typeof content !== 'string') return 'Message content must be a string.'
    const text = content.trim()
    if (!text) return 'Empty message.'
    if (text.length > MAX_CHARS_PER_MSG) return 'Message too long.'
    total += text.length
    if (total > MAX_CHARS_TOTAL) return 'Conversation too long. Start a new one.'
    messages.push({ role, content: text })
  }

  if (messages[messages.length - 1].role !== 'user') return 'Last message must be from the user.'
  return messages
}

/** Pulls the text delta out of one SSE line, or null if the line carries none. */
function parseLine(line: string): string | null {
  const trimmed = line.trim()
  // OpenRouter sends ": OPENROUTER PROCESSING" comments as keepalives.
  if (!trimmed || trimmed.startsWith(':') || !trimmed.startsWith('data:')) return null
  const payload = trimmed.slice(5).trim()
  if (payload === '[DONE]') return null
  try {
    const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content
    return typeof delta === 'string' && delta ? delta : null
  } catch {
    // A partial or unparseable frame — skip it rather than kill the stream.
    return null
  }
}

/**
 * Reads OpenRouter's SSE stream and emits plain UTF-8 text deltas, so the
 * browser can just read the body — no SSE parsing on the client.
 *
 * `pull` must keep reading until it enqueues something or upstream ends:
 * a pull that returns having enqueued nothing is never called again, and
 * keepalive comments and split frames both produce exactly that — so
 * returning early would stall the response forever.
 */
function toTextStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  const reader = upstream.getReader()
  let buffer = ''

  return new ReadableStream({
    async pull(controller) {
      for (;;) {
        const { done, value } = await reader.read()

        if (done) {
          // A final frame with no trailing newline is still a frame.
          const tail = parseLine(buffer)
          if (tail) controller.enqueue(encoder.encode(tail))
          controller.close()
          return
        }

        buffer += decoder.decode(value, { stream: true })

        // Keep the last partial line in the buffer for the next chunk.
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        let emitted = false
        for (const line of lines) {
          const delta = parseLine(line)
          if (delta) {
            controller.enqueue(encoder.encode(delta))
            emitted = true
          }
        }
        if (emitted) return
      }
    },
    cancel(reason) {
      reader.cancel(reason).catch(() => {})
    },
  })
}

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'POST') return fail(405, 'Method not allowed.', origin)

  // No allow-origin header means the Origin was not on the list.
  if (!cors['Access-Control-Allow-Origin']) {
    return fail(403, 'This endpoint only serves emilbob.github.io.', origin)
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return fail(500, 'Server is missing its API key.', origin)

  const ip =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  if (rateLimited(ip)) {
    return fail(429, 'Too many messages — give it a few minutes.', origin)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return fail(400, 'Malformed body.', origin)
  }

  const parsed = parseMessages(body)
  if (typeof parsed === 'string') return fail(400, parsed, origin)

  let upstream: Response
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Attribution on openrouter.ai/rankings; both are optional.
        'HTTP-Referer': 'https://emilbob.github.io',
        'X-Title': 'emilbob.github.io',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
        stream: true,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.4,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...parsed],
      }),
    })
  } catch {
    return fail(502, 'Could not reach the model provider.', origin)
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    console.error('openrouter error', upstream.status, detail.slice(0, 500))
    // Don't leak provider internals to the page; log them instead.
    return fail(502, 'The model provider returned an error.', origin)
  }

  return new Response(toTextStream(upstream.body), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
      ...cors,
    },
  })
}
