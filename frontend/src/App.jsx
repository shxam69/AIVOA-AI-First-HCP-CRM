import { useEffect, useState } from "react";
import { Moon, Sun, Activity, Zap } from "lucide-react";
import "./App.css";
import InteractionForm from "./components/InteractionForm";
import AIAssistant from "./components/AIAssistant";

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("aivoa-theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aivoa-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="app-shell">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <Activity size={16} />
          </div>
          <div className="navbar-brand-text">
            <span className="navbar-title">AIVOA</span>
            <span className="navbar-subtitle">HCP CRM Platform</span>
          </div>
          <div className="navbar-divider" />
          <span className="navbar-tag">
            <Zap size={10} />
            AI-First
          </span>
        </div>

        <div className="navbar-actions">
          <button
            className="btn-icon"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </nav>

      {/* Main Body */}
      <div className="app-body">
        <div className="form-column">
          <InteractionForm />
        </div>
        <div className="assistant-column">
          <AIAssistant />
        </div>
      </div>
    </div>
  );
}

export default App;
