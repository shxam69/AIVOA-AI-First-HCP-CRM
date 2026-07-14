import { useDispatch, useSelector } from "react-redux";
import {
  User, Calendar, Clock, Users, MessageSquare,
  Mic, Search, Package, Sparkles, FileText,
  TrendingUp, BookOpen, CheckSquare,
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
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
          Log HCP Interaction
        </h2>
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
          Fill in the fields manually or use the AI assistant to auto-populate from natural language.
        </p>
      </div>

      {/* ── Section 1: Basic Info ── */}
      <div className="form-section">
        <div className="section-header">
          <div className="section-header-icon"><User size={13} /></div>
          <div className="section-header-text">
            <div className="section-header-title">Healthcare Professional</div>
            <div className="section-header-desc">Primary contact and interaction type</div>
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field-label">HCP Name</label>
            <div className="field-input-wrap">
              <User size={13} className="field-input-icon" />
              <input
                className="field-input"
                value={formData.hcp_name}
                placeholder="e.g. Dr. Ananya Rao"
                onChange={set("hcp_name")}
              />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Interaction Type</label>
            <input
              className="field-input"
              value={formData.interaction_type}
              placeholder="Meeting / Call / Email"
              onChange={set("interaction_type")}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field-label">Date</label>
            <div className="field-input-wrap">
              <Calendar size={13} className="field-input-icon" />
              <input
                className="field-input"
                value={formData.interaction_date}
                placeholder="YYYY-MM-DD"
                onChange={set("interaction_date")}
              />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Time</label>
            <div className="field-input-wrap">
              <Clock size={13} className="field-input-icon" />
              <input
                className="field-input"
                value={formData.interaction_time}
                placeholder="e.g. 10:00 AM"
                onChange={set("interaction_time")}
              />
            </div>
          </div>
        </div>
        <div className="field">
          <label className="field-label">Attendees</label>
          <div className="field-input-wrap">
            <Users size={13} className="field-input-icon" />
            <input
              className="field-input"
              value={formData.attendees}
              placeholder="Names separated by commas"
              onChange={set("attendees")}
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Discussion ── */}
      <div className="form-section">
        <div className="section-header">
          <div className="section-header-icon"><MessageSquare size={13} /></div>
          <div className="section-header-text">
            <div className="section-header-title">Discussion &amp; Outcomes</div>
            <div className="section-header-desc">Topics covered and key results</div>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Topics Discussed</label>
          <textarea
            className="field-textarea"
            value={formData.topics_discussed}
            placeholder="Key topics, products, or clinical data discussed…"
            onChange={set("topics_discussed")}
          />
        </div>

        <button className="voice-btn" type="button" disabled>
          <Mic size={12} />
          Transcribe from Voice Note (Requires Consent)
        </button>

        <div className="field">
          <label className="field-label">Outcomes</label>
          <textarea
            className="field-textarea"
            value={formData.outcomes}
            placeholder="Agreements reached, decisions made, next steps agreed…"
            onChange={set("outcomes")}
          />
        </div>

        {/* Sentiment */}
        <div className="field">
          <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <TrendingUp size={11} /> HCP Sentiment
          </label>
          <div className="sentiment-group">
            {[
              { value: "positive", label: "Positive" },
              { value: "neutral",  label: "Neutral"  },
              { value: "negative", label: "Negative" },
            ].map(({ value, label }) => (
              <label key={value} className={`sentiment-btn ${value}`}>
                <input
                  type="radio"
                  name="sentiment"
                  checked={formData.sentiment?.toLowerCase() === value}
                  onChange={() => setSentiment(value)}
                />
                <span className="sentiment-indicator" />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 3: Materials ── */}
      <div className="form-section">
        <div className="section-header">
          <div className="section-header-icon"><BookOpen size={13} /></div>
          <div className="section-header-text">
            <div className="section-header-title">Materials &amp; Samples</div>
            <div className="section-header-desc">Items shared during the interaction</div>
          </div>
        </div>

        <div className="material-card">
          <div className="material-card-icon"><Search size={14} /></div>
          <div className="material-card-body">
            <div className="material-card-title">
              Materials Shared
              <span className="material-card-action"><Search size={10} />Search / Add</span>
            </div>
            <div className="material-card-value">
              {formData.materials_shared || "No materials recorded yet."}
            </div>
          </div>
        </div>

        <div className="material-card">
          <div className="material-card-icon"><Package size={14} /></div>
          <div className="material-card-body">
            <div className="material-card-title">
              Samples Distributed
              <span className="material-card-action"><Package size={10} />Add Sample</span>
            </div>
            <div className="material-card-value">
              {formData.samples_distributed || "No samples recorded yet."}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 4: Follow-up ── */}
      <div className="form-section">
        <div className="section-header">
          <div className="section-header-icon"><CheckSquare size={13} /></div>
          <div className="section-header-text">
            <div className="section-header-title">Follow-up Actions</div>
            <div className="section-header-desc">Tasks and scheduled next steps</div>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Follow-up Actions</label>
          <textarea
            className="field-textarea"
            value={formData.follow_up_actions}
            placeholder="Scheduled meetings, tasks, or commitments made…"
            onChange={set("follow_up_actions")}
          />
        </div>

        <div className="ai-suggestions">
          <div className="ai-suggestions-label">
            <Sparkles size={10} /> AI Suggested Follow-ups
          </div>
          <div className="ai-suggestions-list">
            <div className="ai-suggestion-item">Schedule a follow-up meeting to review treatment outcomes</div>
            <div className="ai-suggestion-item">Send requested clinical materials within 48 hours</div>
            <div className="ai-suggestion-item">Add HCP to advisory board follow-up list</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractionForm;
