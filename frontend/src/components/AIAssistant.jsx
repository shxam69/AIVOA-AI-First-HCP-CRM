import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bot,
  CheckCircle2,
  Database,
  FileEdit,
  FilePlus2,
  Mic,
  MicOff,
  PackagePlus,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  resetInteraction,
  sendChatMessage,
} from "../store/interactionSlice";

const toolDetails = {
  log_interaction: {
    label: "Log Interaction",
    description: "CRM fields extracted and synchronized",
    icon: FilePlus2,
  },
  edit_interaction: {
    label: "Edit Interaction",
    description: "Requested fields updated while preserving state",
    icon: FileEdit,
  },
  add_material: {
    label: "Add Material",
    description: "Material added to the current interaction",
    icon: PackagePlus,
  },
  schedule_follow_up: {
    label: "Schedule Follow-up",
    description: "Follow-up action structured and scheduled",
    icon: WandSparkles,
  },
  save_interaction: {
    label: "Save Interaction",
    description: "Interaction persisted successfully",
    icon: Database,
  },
};

const promptSuggestions = [
  "Add a clinical study report",
  "Schedule a follow-up next Monday",
  "Save this interaction",
];

const MAX_TEXTAREA_HEIGHT = 144;

function ToolExecutionCard({ tool, savedInteractionId }) {
  const details = toolDetails[tool];

  if (!details) {
    return null;
  }

  const Icon = details.icon;

  return (
    <div className="tool-card">
      <div className="tool-card-icon">
        <Icon size={17} />
      </div>

      <div className="tool-card-content">
        <span className="tool-card-eyebrow">
          LangGraph Agent
        </span>

        <strong>{details.label}</strong>
        <p>{details.description}</p>

        {savedInteractionId && (
          <div className="save-confirmation">
            <CheckCircle2 size={14} />
            Interaction #{savedInteractionId} saved to MySQL
          </div>
        )}
      </div>

      <CheckCircle2 className="tool-card-check" size={18} />
    </div>
  );
}

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const baseMessageRef = useRef("");

  const dispatch = useDispatch();

  const {
    messages,
    loading,
  } = useSelector((state) => state.interaction);

  // Keep chat history scrolled to the latest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Auto-grow the composer textarea as the message changes, and shrink it
  // back down (e.g. after a send clears the message).
  const resizeTextarea = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      MAX_TEXTAREA_HEIGHT
    )}px`;

    textarea.style.overflowY =
      textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  };

  useEffect(() => {
    resizeTextarea();
  }, [message]);

  // Set up browser speech recognition once on mount.
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      const base = baseMessageRef.current;
      const separator = base && !base.endsWith(" ") ? " " : "";

      setMessage(`${base}${separator}${transcript}`);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      baseMessageRef.current = message;
      recognitionRef.current.start();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message.trim() || loading) {
      return;
    }

    const currentMessage = message;
    setMessage("");

    await dispatch(sendChatMessage(currentMessage));
  };

  const handleReset = () => {
    setMessage("");
    dispatch(resetInteraction());
  };

  return (
    <aside className="assistant-panel">
      <div className="assistant-header enhanced-header">
        <div className="assistant-title">
          <div className="assistant-avatar">
            <Bot size={20} />
          </div>

          <div>
            <div className="assistant-heading-row">
              <h2>AI Assistant</h2>
              <span className="ai-status">
                <span className="status-dot" />
                Online
              </span>
            </div>

            <p>Powered by LangGraph + Groq</p>
          </div>
        </div>

        <button
          className="new-interaction-button"
          type="button"
          onClick={handleReset}
          disabled={loading}
          title="Start new interaction"
        >
          <RotateCcw size={15} />
          New
        </button>
      </div>

      <div className="chat-area" role="log" aria-live="polite">
        <div className="assistant-intro">
          <div className="intro-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <strong>AI-first interaction logging</strong>
            <p>
              Describe your HCP meeting naturally. I’ll select the
              appropriate agent tool and synchronize the CRM form.
            </p>
          </div>
        </div>

        {messages.map((chatMessage, index) => (
          <div
            className={`message-group ${chatMessage.role}`}
            key={`${chatMessage.role}-${index}`}
          >
            <div className={`chat-message ${chatMessage.role}`}>
              {chatMessage.content}
            </div>

            {chatMessage.role === "assistant" && chatMessage.tool && (
              <ToolExecutionCard
                tool={chatMessage.tool}
                savedInteractionId={chatMessage.savedInteractionId}
              />
            )}
          </div>
        ))}

        {loading && (
          <div className="agent-processing-card">
            <div className="processing-icon">
              <Sparkles size={17} />
            </div>

            <div>
              <strong>LangGraph Agent is working</strong>

              <div className="processing-stages">
                <span>Understanding request</span>
                <span>•</span>
                <span>Selecting tool</span>
                <span>•</span>
                <span>Updating CRM</span>
              </div>
            </div>

            <div className="typing-dots">
              <i />
              <i />
              <i />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="prompt-suggestions">
        <span className="suggestion-label">Quick actions</span>

        <div className="suggestion-list">
          {promptSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => setMessage(suggestion)}
            >
              <Plus size={12} />
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <form className="chat-input-area enhanced-input" onSubmit={handleSubmit}>
        {voiceSupported && (
          <button
            type="button"
            className={`mic-button ${isListening ? "listening" : ""}`}
            onClick={toggleVoiceInput}
            disabled={loading}
            title={isListening ? "Stop voice input" : "Start voice input"}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            aria-pressed={isListening}
          >
            {isListening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>
        )}

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Describe an HCP interaction or request an update..."
          rows="1"
          disabled={loading}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
        />

        <button
          className="send-button"
          type="submit"
          disabled={loading || !message.trim()}
        >
          {loading ? <Sparkles size={17} /> : <Send size={17} />}
        </button>
      </form>

      <div className="assistant-footer">
        <Sparkles size={11} />
        AI-generated CRM updates remain visible for review before saving
      </div>
    </aside>
  );
}

export default AIAssistant;
