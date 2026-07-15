import { useState, useEffect } from "react";
import api from "../services/api";
import { Clock, AlertCircle, ChevronDown, ChevronUp, Calendar, FileText } from "lucide-react";

const HistoryView = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get("/interactions");
        setHistory(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="history-loading">
        <Clock className="history-icon history-spinner" />
        <p>Loading interaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-error">
        <AlertCircle className="history-icon" />
        <p>{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="history-empty">
        <FileText className="history-icon" />
        <p>No interactions logged yet.</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2 className="history-header">Interaction History</h2>
      <div className="history-list">
        {history.map((record) => (
          <div 
            key={record.id} 
            className={`history-card ${expandedId === record.id ? 'expanded' : ''}`}
            onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
          >
            <div className="history-card-header">
              <div className="history-card-main">
                <h3>{record.hcp_name || "Unknown HCP"}</h3>
                <span className="history-type-badge">{record.interaction_type || "Meeting"}</span>
              </div>
              <div className="history-card-meta">
                <span className="history-date">
                  <Calendar size={14} /> 
                  {record.interaction_date || "No date"}
                </span>
                {expandedId === record.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>
            
            {expandedId === record.id && (
              <div className="history-card-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Sentiment</span>
                    <span className="detail-value">{record.sentiment || "—"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Saved</span>
                    <span className="detail-value">
                      {record.created_at ? new Date(record.created_at).toLocaleString() : "—"}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Attendees</h4>
                  <p>{record.attendees || "—"}</p>
                </div>
                
                <div className="detail-section">
                  <h4>Topics Discussed</h4>
                  <p>{record.topics_discussed || "—"}</p>
                </div>
                
                <div className="detail-section">
                  <h4>Materials Shared</h4>
                  <p>{record.materials_shared || "—"}</p>
                </div>
                
                <div className="detail-section">
                  <h4>Samples Distributed</h4>
                  <p>{record.samples_distributed || "—"}</p>
                </div>
                
                <div className="detail-section">
                  <h4>Outcomes</h4>
                  <p>{record.outcomes || "—"}</p>
                </div>
                
                <div className="detail-section">
                  <h4>Follow-up Actions</h4>
                  <p>{record.follow_up_actions || "—"}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
