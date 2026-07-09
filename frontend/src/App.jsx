import InteractionForm from "./components/InteractionForm";
import AIAssistant from "./components/AIAssistant";

function App() {
  return (
    <main className="app-shell">
      <h1>Log HCP Interaction</h1>

      <div className="workspace">
        <InteractionForm />
        <AIAssistant />
      </div>
    </main>
  );
}

export default App;