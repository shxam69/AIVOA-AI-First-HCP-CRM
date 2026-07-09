import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import InteractionForm from "./components/InteractionForm";
import AIAssistant from "./components/AIAssistant";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("aivoa-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aivoa-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Log HCP Interaction</h1>
          <p>AI-first healthcare professional interaction management</p>
        </div>

        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${
            theme === "dark" ? "light" : "dark"
          } theme`}
          title={`Switch to ${
            theme === "dark" ? "light" : "dark"
          } theme`}
        >
          {theme === "dark" ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
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