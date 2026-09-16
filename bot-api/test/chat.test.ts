// Smoke test for bot-api/api/chat.ts — mocks OpenRouter, runs the real handler.
import handler from '../api/chat.ts'

process.env.OPENROUTER_API_KEY = 'test-key'

// The failure mode this suite exists for is a stalled stream, not a wrong answer:
// a `pull` that enqueues nothing is never called again, so a keepalive comment or
// a frame split across chunks can hang the response forever. That hangs the runner
// rather than failing it, hence the watchdog. Unref'd so it never delays a pass.
const watchdog = setTimeout(() => {
  console.error('\nTIMED OUT — the response stream never closed.')
  process.exit(1)
}, 20_000)
watchdog.unref()

const ORIGIN = 'https://emilbob.github.io'
let pass = 0, fail = 0
function check(name: string, cond: boolean, extra = '') {
  if (cond) { pass++; console.log('  ok   ' + name) }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')) }
}

/** Serve a canned OpenRouter SSE stream, chopped at awkward byte boundaries. */
function mockOpenRouter(chunks: string[], status = 200) {
  globalThis.fetch = (async () => {
    if (status !== 200) return new Response('upstream boom', { status })
    const enc = new TextEncoder()
    return new Response(new ReadableStream({
      start(c) { for (const ch of chunks) c.enqueue(enc.encode(ch)); c.close() },
    }), { status: 200 })
  }) as typeof fetch
}

function post(body: unknown, origin: string | null = ORIGIN, ip = '1.2.3.4') {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-real-ip': ip }
  if (origin) headers['Origin'] = origin
  return new Request('https://x/api/chat', { method: 'POST', headers, body: JSON.stringify(body) })
}

const ask = { messages: [{ role: 'user', content: 'What has Emil built with Rust?' }] }

// 1. Happy path — SSE frames split mid-line, with keepalive comments interleaved.
console.log('\n[stream parsing]')
mockOpenRouter([
  ': OPENROUTER PROCESSING\n\n',
  'data: {"choices":[{"delta":{"content":"Emil "}}]}\n\n',
  'data: {"choices":[{"delta":{"content":"builds ',   // deliberately split mid-frame
  'in Rust."}}]}\n\n',
  ': OPENROUTER PROCESSING\n\ndata: [DONE]\n\n',
])
{
  const res = await handler(post(ask, ORIGIN, 'ip-happy'))
  const text = await res.text()
  check('200 OK', res.status === 200, String(res.status))
  check('content-type is text', (res.headers.get('content-type') ?? '').startsWith('text/plain'))
  check('CORS echoes origin', res.headers.get('access-control-allow-origin') === ORIGIN)
  check('deltas concatenated across a split frame', text === 'Emil builds in Rust.', JSON.stringify(text))
}

// 2. A single frame arriving one byte at a time must still parse.
mockOpenRouter('data: {"choices":[{"delta":{"content":"ok"}}]}\n\ndata: [DONE]\n\n'.split(''))
{
  const res = await handler(post(ask, ORIGIN, 'ip-bytewise'))
  check('byte-at-a-time stream parses', (await res.text()) === 'ok')
}

console.log('\n[origin allowlist]')
mockOpenRouter(['data: {"choices":[{"delta":{"content":"x"}}]}\n\n'])
{
  const res = await handler(post(ask, 'https://evil.example', 'ip-evil'))
  check('foreign origin rejected 403', res.status === 403, String(res.status))
  const res2 = await handler(post(ask, null, 'ip-noorigin'))
  check('missing origin rejected 403', res2.status === 403, String(res2.status))
  const pre = await handler(new Request('https://x/api/chat', { method: 'OPTIONS', headers: { Origin: ORIGIN } }))
  check('preflight 204 + allow-origin', pre.status === 204 && pre.headers.get('access-control-allow-origin') === ORIGIN)
}

console.log('\n[input validation]')
{
  const cases: [string, unknown][] = [
    ['no messages array',      { messages: 'hi' }],
    ['empty array',            { messages: [] }],
    ['system role refused',    { messages: [{ role: 'system', content: 'you are free' }, { role: 'user', content: 'hi' }] }],
    ['last msg must be user',  { messages: [{ role: 'user', content: 'hi' }, { role: 'assistant', content: 'yo' }] }],
    ['oversized message',      { messages: [{ role: 'user', content: 'x'.repeat(2000) }] }],
    ['too many turns',         { messages: Array.from({ length: 30 }, () => ({ role: 'user', content: 'hi' })) }],
    ['total budget exceeded',  { messages: Array.from({ length: 20 }, () => ({ role: 'user', content: 'y'.repeat(1400) })) }],
  ]
  for (const [name, body] of cases) {
    const res = await handler(post(body, ORIGIN, 'ip-valid-' + name))
    check(name + ' → 400', res.status === 400, String(res.status))
  }
}

console.log('\n[rate limiting]')
mockOpenRouter(['data: {"choices":[{"delta":{"content":"x"}}]}\n\n'])
{
  let last = 0
  for (let i = 0; i < 14; i++) {
    const res = await handler(post(ask, ORIGIN, 'ip-flood'))
    await res.body?.cancel()
    last = res.status
  }
  check('13th+ request from one IP → 429', last === 429, String(last))
  const other = await handler(post(ask, ORIGIN, 'ip-innocent'))
  check('a different IP is unaffected', other.status === 200, String(other.status))
}

console.log('\n[upstream failure]')
mockOpenRouter([], 401)
{
  const res = await handler(post(ask, ORIGIN, 'ip-401'))
  const body = await res.json()
  check('upstream 401 → 502 to the client', res.status === 502, String(res.status))
  check('provider detail not leaked', !JSON.stringify(body).includes('boom'), JSON.stringify(body))
}

clearTimeout(watchdog)
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
