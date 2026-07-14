import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Activity,
  BarChart2,
  ClipboardList,
  History,
  Moon,
  Save,
  Sun,
  Zap,
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

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aivoa-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleSave = () => {
    dispatch(sendChatMessage("Save this interaction"));
  };

  return (
    <div className="app-shell">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Activity size={16} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-title">AIVOA</span>
            <span className="sidebar-subtitle">HCP CRM Platform</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="sidebar-nav-label">Workspace</span>

          <button type="button" className="nav-item active">
            <span className="nav-item-icon">
              <ClipboardList size={15} />
            </span>
            Log Interaction
            <span className="nav-item-badge">1</span>
          </button>

          <button type="button" className="nav-item disabled" disabled>
            <span className="nav-item-icon">
              <History size={15} />
            </span>
            History
          </button>

          <button type="button" className="nav-item disabled" disabled>
            <span className="nav-item-icon">
              <BarChart2 size={15} />
            </span>
            Analytics
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>

          {/* Powered by Groq badge */}
          <div className="groq-badge" title="Inference powered by Groq">
            <div className="groq-badge-icon">
              <Zap size={12} />
            </div>
            <div className="groq-badge-text">
              <span className="groq-badge-label">Powered by</span>
              <span className="groq-badge-name">Groq</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="main-area">
        {/* Top bar */}
        <div className="top-bar">
          <span className="top-bar-title">Log Interaction</span>
          <div className="top-bar-divider" />
          <span className="draft-badge">
            <span className="draft-badge-dot" />
            Draft
          </span>
          <div className="top-bar-spacer" />
          <button
            type="button"
            className="save-btn"
            onClick={handleSave}
            title="Save this interaction via AI"
          >
            <Save size={13} />
            <span>Save Interaction</span>
          </button>
        </div>

        {/* Body: form + assistant */}
        <div className="app-body">
          <div className="form-column">
            <InteractionForm />
          </div>
          <div className="assistant-column">
            <AIAssistant />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
