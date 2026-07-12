import { useState } from 'react'
import './App.css'

const BACKEND_URL = "http://localhost:8000"

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

const sendMessage = async () => {
  if (!input.trim()) return

  const userMessage = { sender: 'user', text: input }
  const updatedMessages = [...messages, userMessage]
  setMessages(updatedMessages)
  setInput('')
  setLoading(true)

  try {
    // Convert messages into the format backend expects
    const history = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }))

    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, history: history })
    })

    if (!response.ok) throw new Error('Server error')

    const data = await response.json()
    setMessages(prev => [...prev, { sender: 'assistant', text: data.reply }])
  } catch (err) {
    setMessages(prev => [...prev, { sender: 'assistant', text: 'Error: could not reach server.' }])
  } finally {
    setLoading(false)
  }
}

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="message assistant">Thinking...</div>}
      </div>
      <div className="input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>Send</button>
      </div>
    </div>
  )
}

export default App