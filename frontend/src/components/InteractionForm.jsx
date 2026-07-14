import { useDispatch, useSelector } from "react-redux";
import {
  Mic, Search, Package, Sparkles,
  User, Calendar, Clock, Users,
  MessageSquare, FileText, TrendingUp,
} from "lucide-react";
import { updateField } from "../store/interactionSlice";

function InteractionForm() {
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state.interaction);

  const set = (field) => (e) =>
    dispatch(updateField({ field, value: e.target.value }));

  const setSentiment = (value) =>
    dispatch(updateField({ field: "sentiment", value }));

  return (
    <section className="interaction-panel">
      <div className="panel-header">
        <FileText size={14} style={{ color: "var(--accent)" }} />
        Interaction Details
      </div>

      <div className="form-content">
        {/* Row 1 */}
        <div className="form-grid">
          <div className="field">
            <label><User size={10} style={{ marginRight: 4, verticalAlign: "middle" }} />HCP Name</label>
            <input
              value={formData.hcp_name}
              placeholder="e.g. Dr. Ananya Rao"
              onChange={set("hcp_name")}
            />
          </div>
          <div className="field">
            <label>Interaction Type</label>
            <input
              value={formData.interaction_type}
              placeholder="Meeting / Call / Email"
              onChange={set("interaction_type")}
            />
          </div>
          <div className="field">
            <label><Calendar size={10} style={{ marginRight: 4, verticalAlign: "middle" }} />Date</label>
            <input
              value={formData.interaction_date}
              placeholder="YYYY-MM-DD"
              onChange={set("interaction_date")}
            />
          </div>
          <div className="field">
            <label><Clock size={10} style={{ marginRight: 4, verticalAlign: "middle" }} />Time</label>
            <input
              value={formData.interaction_time}
              placeholder="e.g. 10:00 AM"
              onChange={set("interaction_time")}
            />
          </div>
        </div>

        {/* Attendees */}
        <div className="field">
          <label><Users size={10} style={{ marginRight: 4, verticalAlign: "middle" }} />Attendees</label>
          <input
            value={formData.attendees}
            placeholder="Enter names separated by commas…"
            onChange={set("attendees")}
          />
        </div>

        {/* Topics */}
        <div className="field">
          <label><MessageSquare size={10} style={{ marginRight: 4, verticalAlign: "middle" }} />Topics Discussed</label>
          <div className="textarea-wrapper">
            <textarea
              value={formData.topics_discussed}
              placeholder="Enter key discussion points…"
              onChange={set("topics_discussed")}
            />
            <Mic size={14} />
          </div>
        </div>

        <button className="voice-button" type="button" disabled>
          <Sparkles size={13} />
          Summarize from Voice Note (Requires Consent)
        </button>

        {/* Materials */}
        <div className="section-title">Materials &amp; Samples</div>

        <div className="material-box">
          <div className="material-row">
            <strong>Materials Shared</strong>
            <span className="fake-action"><Search size={12} />Search / Add</span>
          </div>
          <p>{formData.materials_shared || "No materials added yet."}</p>
        </div>

        <div className="material-box">
          <div className="material-row">
            <strong>Samples Distributed</strong>
            <span className="fake-action"><Package size={12} />Add Sample</span>
          </div>
          <p>{formData.samples_distributed || "No samples added yet."}</p>
        </div>

        {/* Sentiment */}
        <div className="field" style={{ marginTop: 14 }}>
          <label><TrendingUp size={10} style={{ marginRight: 4, verticalAlign: "middle" }} />HCP Sentiment</label>
          <div className="sentiment-options">
            {[
              { value: "positive", label: "Positive" },
              { value: "neutral",  label: "Neutral"  },
              { value: "negative", label: "Negative" },
            ].map(({ value, label }) => (
              <label key={value} className={`sentiment-pill ${value}`}>
                <input
                  type="radio"
                  name="sentiment"
                  checked={formData.sentiment?.toLowerCase() === value}
                  onChange={() => setSentiment(value)}
                />
                <span className="sentiment-dot" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Outcomes */}
        <div className="field">
          <label>Outcomes</label>
          <textarea
            value={formData.outcomes}
            placeholder="Key outcomes or agreements reached…"
            onChange={set("outcomes")}
          />
        </div>

        {/* Follow-up */}
        <div className="field">
          <label>Follow-up Actions</label>
          <textarea
            value={formData.follow_up_actions}
            placeholder="Next steps, tasks, or scheduled meetings…"
            onChange={set("follow_up_actions")}
          />
        </div>

        {/* AI suggestions */}
        <div className="suggestions">
          <strong>AI Suggested Follow-ups</strong>
          <span className="suggestion-chip"><Sparkles size={10} />Schedule follow-up meeting</span>
          <span className="suggestion-chip"><Sparkles size={10} />Send requested clinical materials</span>
          <span className="suggestion-chip"><Sparkles size={10} />Add HCP to advisory follow-up list</span>
        </div>
      </div>
    </section>
  );
}

export default InteractionForm;
