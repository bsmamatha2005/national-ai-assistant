import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Copy, Check, User, Sparkles } from 'lucide-react'

function Message({ sender, text, thinking }) {
  const [copied, setCopied] = useState(false)
  const isUser = sender === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className="avatar">
        {isUser ? <User size={16} /> : <Sparkles size={16} />}
      </div>

      <div className="message-body">
        {thinking ? (
          <div className="thinking-dots">
            <span></span><span></span><span></span>
          </div>
        ) : (
          <>
            <div className="message-text">
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
            {!isUser && (
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Message