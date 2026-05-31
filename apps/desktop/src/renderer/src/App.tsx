import { Button } from '@repo/ui'

function App(): JSX.Element {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Electron + React + Vite + TypeScript</h1>
      <p>
        Platform: <code>{window.api?.platform}</code>
      </p>
      <Button onClick={() => alert('Hello from @repo/ui!')}>Click me</Button>
    </div>
  )
}

export default App
