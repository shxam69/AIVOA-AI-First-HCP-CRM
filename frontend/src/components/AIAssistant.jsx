import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bot, Send } from "lucide-react";

import { sendChatMessage } from "../store/interactionSlice";

function AIAssistant() {
  const [message, setMessage] = useState("");

  const messagesEndRef = useRef(null);

  const dispatch = useDispatch();

  const {
    messages,
    loading,
    activeTool,
    savedInteractionId,
  } = useSelector((state) => state.interaction);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message.trim() || loading) {
      return;
    }

    const currentMessage = message;

    setMessage("");

    await dispatch(sendChatMessage(currentMessage));
  };

  return (
    <aside className="assistant-panel">
      <div className="assistant-header">
        <div className="assistant-title">
          <Bot size={22} />

          <div>
            <h2>AI Assistant</h2>
            <p>Log interaction via chat</p>
          </div>
        </div>
      </div>

      <div className="chat-area">
        {messages.map((chatMessage, index) => (
          <div
            className={`chat-message ${chatMessage.role}`}
            key={`${chatMessage.role}-${index}`}
          >
            {chatMessage.content}
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant processing">
            Analyzing interaction...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="agent-status">
        {activeTool && (
          <span>
            Agent Tool:{" "}
            <strong>
              {activeTool.replaceAll("_", " ")}
            </strong>
          </span>
        )}

        {savedInteractionId && (
          <span>
            Saved as interaction #{savedInteractionId}
          </span>
        )}
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Describe interaction..."
          rows="1"
        />

        <button type="submit" disabled={loading}>
          <Send size={17} />
          {loading ? "..." : "Log"}
        </button>
      </form>
    </aside>
  );
}

export default AIAssistant;