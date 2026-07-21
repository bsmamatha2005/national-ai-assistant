import { useState, useRef, useEffect } from "react";
import { ArrowUp, Mic, Square, Plus, Paperclip, X, FileText } from "lucide-react";

// No visible language picker — recognition defaults to Indian English, which
// Chrome's engine handles reasonably well even with Kannada/Hindi code-switching.
// The backend's own prompt already replies in whatever language the TEXT is in,
// so typed messages in any language work regardless of this setting.
const SPEECH_LANG = "en-IN";

// File types we can actually read and feed to the model as extra context.
const TEXT_LIKE_TYPES = ["text/plain", "text/markdown", "text/csv", "application/json"];
const MAX_FILE_CHARS = 4000;

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function ChatInput({ onSend, loading }) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  // Close the attach menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleFilesPicked = (fileList) => {
    const files = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      file,
    }));
    setAttachedFiles((prev) => [...prev, ...files]);
    setMenuOpen(false);
  };

  const removeFile = (id) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const buildOutgoingMessage = async () => {
    if (attachedFiles.length === 0) return value;

    let combined = value.trim();

    for (const { file } of attachedFiles) {
      if (TEXT_LIKE_TYPES.includes(file.type) || /\.(txt|md|csv|json)$/i.test(file.name)) {
        try {
          const text = await readFileAsText(file);
          combined += `\n\n[Attached file: ${file.name}]\n${text.slice(0, MAX_FILE_CHARS)}`;
        } catch {
          combined += `\n\n[Could not read attached file: ${file.name}]`;
        }
      } else {
        // Images/PDFs etc: the model here is text-only, so just note the filename.
        combined += `\n\n[Attached file (not readable by this model yet): ${file.name}]`;
      }
    }

    return combined;
  };

  const handleSend = async () => {
    if ((!value.trim() && attachedFiles.length === 0) || loading) return;
    const message = await buildOutgoingMessage();
    onSend(message);
    setValue("");
    setAttachedFiles([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported.\nUse Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = SPEECH_LANG;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setValue(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        alert("Microphone permission denied.");
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="input-bar">
      {attachedFiles.length > 0 && (
        <div className="attached-files">
          {attachedFiles.map(({ id, file }) => (
            <div className="file-chip" key={id}>
              <FileText size={14} />
              <span>{file.name}</span>
              <button onClick={() => removeFile(id)} aria-label="Remove file">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="input-bar-inner">
        <div className="attach-menu-wrapper" ref={menuRef}>
          <button
            className="attach-btn"
            onClick={() => setMenuOpen((o) => !o)}
            disabled={loading}
            aria-label="Add files"
          >
            <Plus size={18} />
          </button>

          {menuOpen && (
            <div className="attach-menu">
              <button
                className="attach-menu-item"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={15} />
                Add files or photos
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) handleFilesPicked(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "🎙 Listening..." : "Message your assistant..."}
          disabled={loading}
        />

        <button
          className={`mic-btn ${isListening ? "listening" : ""}`}
          onClick={toggleListening}
          disabled={loading}
          aria-label="Voice input"
        >
          {isListening ? <Square size={18} /> : <Mic size={18} />}
        </button>

        <button
          className="send-btn"
          onClick={handleSend}
          disabled={loading || (!value.trim() && attachedFiles.length === 0)}
          aria-label="Send message"
        >
          <ArrowUp size={18} />
        </button>
      </div>

      <p className="input-hint">Enter to send · Shift + Enter for new line</p>
    </div>
  );
}

export default ChatInput;