import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import WelcomeScreen from './components/WelcomeScreen'
import Message from './components/Message'
import ChatInput from './components/ChatInput'
import Login from './components/Login'
import Signup from './components/Signup'
import { useAuth, BACKEND_URL } from './context/AuthContext'
import './App.css'

function newConversation() {
  return {
    id: crypto.randomUUID(),
    title: 'New Chat',
    messages: []
  }
}

function ChatApp() {
  const { token, user, logout } = useAuth()
  const [conversations, setConversations] = useState([newConversation()])
  const [currentId, setCurrentId] = useState(conversations[0].id)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const scrollRef = useRef(null)

  const current = conversations.find(c => c.id === currentId)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [current?.messages, loading])

  const updateConversation = (id, updater) => {
    setConversations(prev => prev.map(c => c.id === id ? updater(c) : c))
  }

  const handleNewChat = () => {
    const conv = newConversation()
    setConversations(prev => [conv, ...prev])
    setCurrentId(conv.id)
  }

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    const convId = currentId
    const userMessage = { sender: 'user', text }

    updateConversation(convId, c => ({
      ...c,
      title: c.messages.length === 0 ? text.slice(0, 40) : c.title,
      messages: [...c.messages, userMessage]
    }))
    setLoading(true)

    // Placeholder assistant message we'll fill in as tokens stream in.
    updateConversation(convId, c => ({
      ...c,
      messages: [...c.messages, { sender: 'assistant', text: '' }]
    }))

    try {
      const historyForBackend = current.messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: text, history: historyForBackend })
      })

      if (!response.ok) throw new Error('Server error')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        fullText += decoder.decode(value, { stream: true })

        updateConversation(convId, c => {
          const msgs = [...c.messages]
          msgs[msgs.length - 1] = { sender: 'assistant', text: fullText }
          return { ...c, messages: msgs }
        })
      }
    } catch (err) {
      updateConversation(convId, c => {
        const msgs = [...c.messages]
        msgs[msgs.length - 1] = { sender: 'assistant', text: 'Error: could not reach server.' }
        return { ...c, messages: msgs }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        onSelect={setCurrentId}
        onNewChat={handleNewChat}
        collapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        user={user}
        onLogout={logout}
      />

      <main className="main-panel">
        <div className="scroll-area" ref={scrollRef}>
          {current.messages.length === 0 ? (
            <WelcomeScreen onSuggestion={sendMessage} />
          ) : (
            <div className="message-list">
              {current.messages.map((msg, i) => (
                <Message
                  key={i}
                  sender={msg.sender}
                  text={msg.text}
                  thinking={loading && i === current.messages.length - 1 && msg.sender === 'assistant' && msg.text === ''}
                />
              ))}
            </div>
          )}
        </div>

        <ChatInput onSend={sendMessage} loading={loading} />
      </main>
    </div>
  )
}

function App() {
  const { token, loading } = useAuth()
  const [authView, setAuthView] = useState('login')

  if (loading) {
    return <div className="auth-loading">Loading...</div>
  }

  if (!token) {
    return authView === 'login'
      ? <Login onSwitchToSignup={() => setAuthView('signup')} />
      : <Signup onSwitchToLogin={() => setAuthView('login')} />
  }

  return <ChatApp />
}

export default App