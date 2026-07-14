import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bot, CheckCircle2, Database, FileEdit, FilePlus2,
  Mic, MicOff, PackagePlus, Plus, RotateCcw,
  Send, Sparkles, WandSparkles,
} from "lucide-react";
import { resetInteraction, sendChatMessage } from "../store/interactionSlice";

const TOOL_META = {
  log_interaction:   { label: "Log Interaction",    desc: "CRM fields extracted and populated",          Icon: FilePlus2   },
  edit_interaction:  { label: "Edit Interaction",   desc: "Selected fields updated, state preserved",    Icon: FileEdit    },
  add_material:      { label: "Material Added",     desc: "Item appended to materials list",             Icon: PackagePlus },
  schedule_follow_up:{ label: "Follow-up Scheduled",desc: "Action structured and dates resolved",        Icon: WandSparkles},
  save_interaction:  { label: "Interaction Saved",  desc: "Record persisted to the database",            Icon: Database    },
};

const QUICK_ACTIONS = [
  "Add a clinical study report",
  "Schedule follow-up next Monday",
  "Save this interaction",
];

const MAX_H = 140;

function ToolResult({ tool, savedId }) {
  const meta = TOOL_META[tool];
  if (!meta) return null;
  const { Icon, label, desc } = meta;
  return (
    <div className="tool-result">
      <div className="tool-result-icon"><Icon size={14} /></div>
      <div className="tool-result-body">
        <div className="tool-result-eyebrow">LangGraph · Tool Executed</div>
        <div className="tool-result-name">{label}</div>
        <div className="tool-result-desc">{desc}</div>
        {savedId && (
          <div className="tool-result-saved">
            <CheckCircle2 size={12} />
            Record #{savedId} saved
          </div>
        )}
      </div>
      <CheckCircle2 className="tool-result-check" size={16} />
    </div>
  );
}

export default function AIAssistant() {
  const [msg, setMsg] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState(true);
  const [voiceErr, setVoiceErr] = useState(false);

  const bottomRef  = useRef(null);
  const areaRef    = useRef(null);
  const recogRef   = useRef(null);
  const recogActive= useRef(false);
  const baseMsg    = useRef("");

  const dispatch = useDispatch();
  const { messages, loading } = useSelector((s) => s.interaction);

  /* scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* auto-grow textarea */
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, MAX_H) + "px";
    el.style.overflowY = el.scrollHeight > MAX_H ? "auto" : "hidden";
  }, [msg]);

  /* speech recognition */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceOk(false); return; }

    const r = new SR();
    r.continuous = false; r.interimResults = true; r.lang = "en-IN";

    r.onstart  = () => { setListening(true);  setVoiceErr(false); };
    r.onend    = () => { recogActive.current = false; setListening(false); };
    r.onerror  = (e) => {
      recogActive.current = false; setListening(false);
      if (e.error !== "no-speech" && e.error !== "aborted") setVoiceErr(true);
    };
    r.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      const base = baseMsg.current;
      setMsg(base + (base && !base.endsWith(" ") ? " " : "") + t);
    };

    recogRef.current = r;
    return () => { recogActive.current = false; r.stop(); recogRef.current = null; };
  }, []);

  const toggleMic = () => {
    if (!recogRef.current) return;
    if (listening || recogActive.current) {
      recogActive.current = false;
      try { recogRef.current.stop(); } catch {}
    } else {
      baseMsg.current = msg;
      recogActive.current = true;
      try { recogRef.current.start(); }
      catch { recogActive.current = false; setListening(false); setVoiceErr(true); }
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!msg.trim() || loading) return;
    const text = msg;
    setMsg("");
    await dispatch(sendChatMessage(text));
  };

  const reset = () => { setMsg(""); dispatch(resetInteraction()); };

  return (
    <aside className="assistant-panel">

      {/* Header */}
      <div className="assistant-header">
        <div className="assistant-brand">
          <div className="assistant-avatar"><Bot size={17} /></div>
          <div className="assistant-info">
            <div className="assistant-name">AI Assistant</div>
            <div className="assistant-meta">LangGraph · Groq · llama-3.3-70b</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="online-badge">
            <span className="online-dot" />
            Online
          </span>
          <button
            className="btn-ghost"
            type="button"
            onClick={reset}
            disabled={loading}
            title="New interaction"
          >
            <RotateCcw size={12} />
            New
          </button>
        </div>
      </div>

      {/* Chat */}
      <div className="chat-area" role="log" aria-live="polite">

        <div className="intro-banner">
          <div className="intro-banner-icon"><Sparkles size={14} /></div>
          <div>
            <strong>AI-first interaction logging</strong>
            <p>Describe your HCP meeting in plain language. The agent will extract structured data and populate the form automatically.</p>
          </div>
        </div>

        {messages.map((m, i) => (
          <div className={`message-group ${m.role}`} key={`${m.role}-${i}`}>
            <div className={`chat-bubble ${m.role}`}>{m.content}</div>
            {m.role === "assistant" && m.tool && (
              <ToolResult tool={m.tool} savedId={m.savedInteractionId} />
            )}
          </div>
        ))}

        {loading && (
          <div className="thinking-card">
            <div className="thinking-spinner" />
            <div className="thinking-text">
              <strong>Agent is processing…</strong>
              <div className="thinking-stages">
                <span>Parsing request</span>
                <span>·</span>
                <span>Selecting tool</span>
                <span>·</span>
                <span>Updating form</span>
              </div>
            </div>
            <div className="typing-dots"><i /><i /><i /></div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <span className="quick-actions-label">Quick:</span>
        {QUICK_ACTIONS.map((q) => (
          <button
            key={q}
            className="quick-btn"
            type="button"
            disabled={loading}
            onClick={() => setMsg(q)}
          >
            <Plus size={10} />
            {q}
          </button>
        ))}
      </div>

      {voiceErr && (
        <div className="voice-error-msg">
          Voice input unavailable — use Chrome or Edge.
        </div>
      )}

      {/* Composer */}
      <form className="composer" onSubmit={submit}>
        {voiceOk && (
          <button
            type="button"
            className={`mic-btn${listening ? " active" : ""}`}
            onClick={toggleMic}
            disabled={loading}
            aria-label={listening ? "Stop voice input" : "Start voice input"}
            aria-pressed={listening}
          >
            {listening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
        )}
        <textarea
          ref={areaRef}
          className="composer-textarea"
          value={msg}
          rows={1}
          disabled={loading}
          placeholder="Describe an HCP interaction or ask for an update…"
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit(e);
            }
          }}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={loading || !msg.trim()}
          aria-label="Send message"
        >
          {loading ? <Sparkles size={15} /> : <Send size={15} />}
        </button>
      </form>

      <div className="chat-footer">
        <Sparkles size={10} />
        AI-generated updates are previewed in the form before saving
      </div>
    </aside>
  );
}
