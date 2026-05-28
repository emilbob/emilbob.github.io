const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#%^&*<>/?'

export function scramble(
  el: HTMLElement,
  finalText: string,
  { duration = 800, delay = 0 }: { duration?: number; delay?: number } = {},
) {
  let frame: ReturnType<typeof setInterval>
  let iteration = 0
  const steps = duration / 30

  const start = () => {
    frame = setInterval(() => {
      el.textContent = finalText
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' '
          if (i < (iteration / steps) * finalText.length) return finalText[i]
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join('')

      iteration++
      if (iteration > steps) {
        el.textContent = finalText
        clearInterval(frame)
      }
    }, 30)
  }

  if (delay > 0) {
    setTimeout(start, delay)
  } else {
    start()
  }

  return () => clearInterval(frame)
}
