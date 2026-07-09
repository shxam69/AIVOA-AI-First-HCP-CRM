import { useSelector } from "react-redux";
import { Mic, Search, Package, Sparkles } from "lucide-react";

function InteractionForm() {
  const { formData } = useSelector((state) => state.interaction);

  return (
    <section className="interaction-panel">
      <div className="panel-header">Interaction Details</div>

      <div className="form-content">
        <div className="form-grid">
          <div className="field">
            <label>HCP Name</label>
            <input
              value={formData.hcp_name}
              placeholder="Search or select HCP..."
              readOnly
            />
          </div>

          <div className="field">
            <label>Interaction Type</label>
            <input value={formData.interaction_type} readOnly />
          </div>

          <div className="field">
            <label>Date</label>
            <input value={formData.interaction_date} readOnly />
          </div>

          <div className="field">
            <label>Time</label>
            <input value={formData.interaction_time} readOnly />
          </div>
        </div>

        <div className="field">
          <label>Attendees</label>
          <input
            value={formData.attendees}
            placeholder="Enter names or search..."
            readOnly
          />
        </div>

        <div className="field">
          <label>Topics Discussed</label>
          <div className="textarea-wrapper">
            <textarea
              value={formData.topics_discussed}
              placeholder="Enter key discussion points..."
              readOnly
            />
            <Mic size={16} />
          </div>
        </div>

        <button className="voice-button" type="button" disabled>
          <Sparkles size={15} />
          Summarize from Voice Note (Requires Consent)
        </button>

        <h3>Materials Shared / Samples Distributed</h3>

        <div className="material-box">
          <div className="material-row">
            <strong>Materials Shared</strong>

            <span className="fake-action">
              <Search size={15} />
              Search/Add
            </span>
          </div>

          <p>
            {formData.materials_shared || "No materials added."}
          </p>
        </div>

        <div className="material-box">
          <div className="material-row">
            <strong>Samples Distributed</strong>

            <span className="fake-action">
              <Package size={15} />
              Add Sample
            </span>
          </div>

          <p>
            {formData.samples_distributed || "No samples added."}
          </p>
        </div>

        <div className="field">
          <label>Observed/Inferred HCP Sentiment</label>

          <div className="sentiment-options">
            {["positive", "neutral", "negative"].map((sentiment) => (
              <label key={sentiment}>
                <input
                  type="radio"
                  checked={
                    formData.sentiment?.toLowerCase() === sentiment
                  }
                  readOnly
                />

                <span>
                  {sentiment.charAt(0).toUpperCase() +
                    sentiment.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Outcomes</label>
          <textarea
            value={formData.outcomes}
            placeholder="Key outcomes or agreements..."
            readOnly
          />
        </div>

        <div className="field">
          <label>Follow-up Actions</label>
          <textarea
            value={formData.follow_up_actions}
            placeholder="Enter next steps or tasks..."
            readOnly
          />
        </div>

        <div className="suggestions">
          <strong>AI Suggested Follow-ups:</strong>
          <span>+ Schedule follow-up meeting</span>
          <span>+ Send requested clinical materials</span>
          <span>+ Add HCP to advisory follow-up list</span>
        </div>
      </div>
    </section>
  );
}

export default InteractionForm;