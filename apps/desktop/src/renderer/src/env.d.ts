/// <reference types="vite/client" />

declare const APP_VERSION: string

interface Window {
  api: {
    platform: string
    send: (channel: string, ...args: unknown[]) => void
    on: (channel: string, listener: (...args: unknown[]) => void) => void
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  }
}
