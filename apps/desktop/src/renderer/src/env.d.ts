/// <reference types="vite/client" />

interface Window {
  api: {
    platform: string
    send: (channel: string, ...args: unknown[]) => void
    on: (channel: string, listener: (...args: unknown[]) => void) => void
  }
}
