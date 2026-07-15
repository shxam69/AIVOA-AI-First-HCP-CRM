import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Activity, BarChart2, Bot, ClipboardList,
  History, Moon, Save, Sun, Zap,
} from "lucide-react";
import "./App.css";
import InteractionForm from "./components/InteractionForm";
import AIAssistant from "./components/AIAssistant";
import { sendChatMessage } from "./store/interactionSlice";

function App() {
  const dispatch = useDispatch();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("aivoa-theme") || "light"
  );

  // "form" | "chat"
  const [mobileTab, setMobileTab] = useState("form");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aivoa-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const handleSave  = () => dispatch(sendChatMessage("Save this interaction"));

  return (
    <div className="app-shell">

      {/* ── MOBILE HEADER (≤640px only) ── */}
      <header className="mobile-header">
        <div className="mobile-header-brand">
          <div className="mobile-header-logo"><Activity size={14} /></div>
          <span className="mobile-header-title">AIVOA</span>
        </div>
        <div className="mobile-header-actions">
          <button
            className="mobile-theme-btn"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            className="mobile-save-btn"
            type="button"
            onClick={handleSave}
            aria-label="Save interaction"
          >
            <Save size={13} />
            Save
          </button>
        </div>
      </header>

      {/* ── DESKTOP SIDEBAR (>640px) ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo"><Activity size={16} /></div>
          <div className="sidebar-brand-text">
            <span className="sidebar-title">AIVOA</span>
            <span className="sidebar-subtitle">HCP CRM Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="sidebar-nav-label">Workspace</span>
          <button type="button" className="nav-item active">
            <span className="nav-item-icon"><ClipboardList size={15} /></span>
            Log Interaction
            <span className="nav-item-badge">1</span>
          </button>
          <button type="button" className="nav-item disabled" disabled>
            <span className="nav-item-icon"><History size={15} /></span>
            History
          </button>
          <button type="button" className="nav-item disabled" disabled>
            <span className="nav-item-icon"><BarChart2 size={15} /></span>
            Analytics
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
          <div className="groq-badge" title="Inference powered by Groq">
            <div className="groq-badge-icon"><Zap size={12} /></div>
            <div className="groq-badge-text">
              <span className="groq-badge-label">Powered by</span>
              <span className="groq-badge-name">Groq</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="main-area">

        {/* Desktop top bar */}
        <div className="top-bar">
          <span className="top-bar-title">Log Interaction</span>
          <div className="top-bar-divider" />
          <span className="draft-badge">
            <span className="draft-badge-dot" />
            Draft
          </span>
          <div className="top-bar-spacer" />
          <button type="button" className="save-btn" onClick={handleSave}>
            <Save size={13} />
            <span>Save Interaction</span>
          </button>
        </div>

        {/* Mobile tab switcher (≤640px only) */}
        <div className="mobile-tabs" role="tablist">
          <button
            role="tab"
            className={`mobile-tab${mobileTab === "form" ? " active" : ""}`}
            onClick={() => setMobileTab("form")}
            aria-selected={mobileTab === "form"}
          >
            <ClipboardList size={14} />
            Form
          </button>
          <button
            role="tab"
            className={`mobile-tab${mobileTab === "chat" ? " active" : ""}`}
            onClick={() => setMobileTab("chat")}
            aria-selected={mobileTab === "chat"}
          >
            <Bot size={14} />
            AI Assistant
          </button>
        </div>

        {/* Body */}
        <div className="app-body">
          <div className={`form-column${mobileTab === "form" ? " active" : ""}`}>
            <InteractionForm />
          </div>
          <div className={`assistant-column${mobileTab === "chat" ? " active" : ""}`}>
            <AIAssistant />
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
