const SUGGESTIONS = [
  { kn: 'ಕರ್ನಾಟಕದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಹೇಳಿ', en: 'Tell me about government schemes' },
  { kn: 'ಪಡಿತರ ಚೀಟಿ ಅರ್ಜಿ ಹೇಗೆ ಸಲ್ಲಿಸುವುದು?', en: 'How to apply for a ration card?' },
  { kn: 'ಇಂದಿನ ಸುದ್ದಿ ಸಾರಾಂಶ ಕೊಡಿ', en: "Give today's news summary" },
  { kn: 'ಶಿಕ್ಷಣ ಸೌಲಭ್ಯಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ಬೇಕು', en: 'I need info on education benefits' },
]

function WelcomeScreen({ onSuggestion }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-mark">ನಮಸ್ಕಾರ</div>
      <h1>How can I help you today?</h1>
      <p className="welcome-subtitle">Ask in Kannada or English — I'll answer in kind.</p>

      <div className="suggestion-grid">
        {SUGGESTIONS.map((s, i) => (
          <button key={i} className="suggestion-card" onClick={() => onSuggestion(s.kn)}>
            <span className="suggestion-kn">{s.kn}</span>
            <span className="suggestion-en">{s.en}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default WelcomeScreen