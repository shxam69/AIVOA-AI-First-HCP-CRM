import { useEffect, useState } from "react";
import { Moon, Sun, Activity } from "lucide-react";
import "./App.css";

import InteractionForm from "./components/InteractionForm";
import AIAssistant from "./components/AIAssistant";

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("aivoa-theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aivoa-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <main className="app-shell">
      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "grid", placeItems: "center",
            width: 36, height: 36, borderRadius: 10,
            background: "var(--accent-soft)",
            border: "1px solid var(--accent-glow)",
            color: "var(--accent)", flexShrink: 0,
          }}>
            <Activity size={17} />
          </div>
          <div>
            <h1>AIVOA HCP CRM</h1>
            <p>AI-first healthcare professional interaction management</p>
          </div>
        </div>

        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <section className="workspace">
        <div className="form-column">
          <InteractionForm />
        </div>
        <div className="assistant-column">
          <AIAssistant />
        </div>
      </section>
    </main>
  );
}

export default App;
