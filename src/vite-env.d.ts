/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the OpenRouter proxy, e.g. https://emil-bot.vercel.app/api/chat */
  readonly VITE_BOT_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
