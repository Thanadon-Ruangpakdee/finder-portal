import React, { useState } from 'react';
import { 
  Globe2, 
  Key, 
  Send, 
  CheckCircle2, 
  Building2, 
  Code2, 
  Server,
  Layers
} from './Icons';
import { MOCK_SPACERESERVE_BOOKINGS } from '../services/store';
import { useT } from '../language';

export default function PeerApiExplorer({ items, initialLocation = '' }) {
  const t = useT();
  const [activeSubTab, setActiveSubTab] = useState('consume'); // 'consume' (we call them) or 'expose' (they call us)
  
  // Outgoing State (We call SpaceReserve)
  const [selectedRoom, setSelectedRoom] = useState(initialLocation || 'Room 402 (Engineering Building)');
  const [outgoingTimestamp, setOutgoingTimestamp] = useState('2026-08-11T14:30:00');
  const [outgoingLoading, setOutgoingLoading] = useState(false);
  const [outgoingResponse, setOutgoingResponse] = useState(null);

  // Incoming State (SpaceReserve calls Us)
  const [incomingApiKey, setIncomingApiKey] = useState('fp_peer_api_key_xyz_998877');
  const [incomingLocationQuery, setIncomingLocationQuery] = useState('Room 402 (Engineering Building)');
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [incomingResponse, setIncomingResponse] = useState(null);

  const [copied, setCopied] = useState(false);

  const handleRunOutgoingQuery = () => {
    setOutgoingLoading(true);
    setOutgoingResponse(null);

    fetch('http://localhost:5001/api/v1/peer/check-bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('finder_jwt_token')}`
      },
      body: JSON.stringify({
        location: selectedRoom,
        timestamp: outgoingTimestamp
      })
    })
      .then(async res => {
        const data = await res.json();
        setOutgoingResponse({
          statusCode: res.status,
          statusText: res.statusText,
          data: data
        });
        setOutgoingLoading(false);
      })
      .catch(err => {
        setOutgoingResponse({
          statusCode: 500,
          statusText: 'Internal Error',
          error: err.message
        });
        setOutgoingLoading(false);
      });
  };

  const handleRunIncomingSimulation = () => {
    setIncomingLoading(true);
    setIncomingResponse(null);

    fetch(`http://localhost:5001/api/v1/items/by-location?location=${encodeURIComponent(incomingLocationQuery)}`, {
      headers: {
        'x-api-key': incomingApiKey
      }
    })
      .then(async res => {
        const data = await res.json();
        setIncomingResponse({
          statusCode: res.status,
          statusText: res.statusText,
          data: data
        });
        setIncomingLoading(false);
      })
      .catch(err => {
        setIncomingResponse({
          statusCode: 500,
          statusText: 'Internal Error',
          error: err.message
        });
        setIncomingLoading(false);
      });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="peer-explorer-wrapper">
      {/* Header Info */}
      <div className="peer-header-card glass-card">
        <div className="peer-header-badge">
          <Globe2 size={16} className="text-cyan" />
          <span>{t('Service-to-Service Peer API Architecture')}</span>
        </div>
        <h1 className="peer-title">
          Finder Portal ⇄ <span className="gradient-text">SpaceReserve</span> {t('API Integration')}
        </h1>
        <p className="peer-sub">
          {t('Test live bilateral communication between the University Lost & Found backend and the SpaceReserve room reservation backend.')}
        </p>

        {/* Sub Navigation Segmented Switch */}
        <div className="peer-tab-switcher">
          <button 
            className={`peer-switch-btn ${activeSubTab === 'consume' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('consume')}
          >
            <Server size={17} />
            <span>{t('1. Outgoing (We Call SpaceReserve)')}</span>
          </button>

          <button 
            className={`peer-switch-btn ${activeSubTab === 'expose' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('expose')}
          >
            <Layers size={17} />
            <span>{t('2. Incoming (SpaceReserve Calls Us)')}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Outgoing Query (Finder Portal -> SpaceReserve) */}
      {activeSubTab === 'consume' && (
        <div className="peer-content-grid">
          {/* Left: Request Configuration */}
          <div className="glass-card peer-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Send size={18} className="text-cyan" />
                <span>{t('Outgoing Request Configuration')}</span>
              </div>
              <span className="badge badge-found">{t('GET Request')}</span>
            </div>

            <p className="panel-desc">
              {t('When a found item is recorded, Finder Portal queries SpaceReserve to check who booked that specific room at that time.')}
            </p>

            <div className="api-endpoint-badge">
              <span className="http-method">GET</span>
              <span className="http-url">https://spacereserve.uni.edu/api/v1/external/bookings/active-at</span>
            </div>

            <div className="input-group">
              <label className="input-label">{t('Select Room to Inquire *')}</label>
              <select 
                className="select-field"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <option value="Room 402 (Engineering Building)">{t('Room 402 (Engineering Building)')}</option>
                <option value="Library Room 4B / Music Practice Lab">{t('Library Room 4B / Music Practice Lab')}</option>
                <option value="Central Library (3rd Floor)">{t('Central Library (3rd Floor)')}</option>
                <option value="Unknown Hallway 101">{t('Unknown Hallway 101 (Non-bookable space)')}</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">{t('Timestamp of Discovery')}</label>
              <input 
                type="datetime-local"
                className="input-field"
                value={outgoingTimestamp}
                onChange={(e) => setOutgoingTimestamp(e.target.value)}
              />
            </div>

            <div className="auth-header-preview">
              <div className="auth-label">
                <Key size={14} />
                <span>{t('SpaceReserve Authentication Header:')}</span>
              </div>
              <code>Authorization: Bearer sr_peer_token_88192a_sec</code>
            </div>

            <button 
              className="btn btn-cyan w-full"
              onClick={handleRunOutgoingQuery}
              disabled={outgoingLoading}
            >
              <Send size={16} />
              <span>{outgoingLoading ? t('Executing Peer Query...') : t('Send Request to SpaceReserve')}</span>
            </button>
          </div>

          {/* Right: SpaceReserve Response Box */}
          <div className="glass-card peer-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Code2 size={18} className="text-purple" />
                <span>{t('SpaceReserve Response Payload')}</span>
              </div>
              {outgoingResponse && (
                <span className={`badge ${outgoingResponse.statusCode === 200 ? 'badge-claimed' : 'badge-lost'}`}>
                  HTTP {outgoingResponse.statusCode} {outgoingResponse.statusText}
                </span>
              )}
            </div>

            {outgoingResponse ? (
              <div className="json-response-container">
                <pre className="json-code-block">
                  {JSON.stringify(outgoingResponse, null, 2)}
                </pre>
                
                {outgoingResponse.statusCode === 200 && (
                  <div className="peer-match-insight-box">
                    <CheckCircle2 size={18} className="text-emerald" />
                    <div>
                      <div className="font-semibold text-sm">{t('Owner Lead Discovered:')}</div>
                      <div className="text-muted text-xs">
                        {t('This room was booked by')} <strong>{outgoingResponse.data.bookedBy}</strong> ({outgoingResponse.data.bookerEmail}) {t('for')} "{outgoingResponse.data.scheduledEvent}".
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-response-state">
                <Building2 size={36} className="text-muted" />
                <div className="empty-title">{t('Awaiting Execution')}</div>
                <p className="empty-desc">{t('Click "Send Request" on the left to simulate calling SpaceReserve\'s REST API.')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Incoming Simulation (SpaceReserve -> Finder Portal) */}
      {activeSubTab === 'expose' && (
        <div className="peer-content-grid">
          {/* Left: SpaceReserve Call Config */}
          <div className="glass-card peer-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Server size={18} className="text-emerald" />
                <span>{t('Exposed Endpoint Simulator')}</span>
              </div>
              <span className="badge badge-found">GET /api/v1/items/by-location</span>
            </div>

            <p className="panel-desc">
              {t('When a student checks in to SpaceReserve, their backend queries Finder Portal to see if any items were left behind in that room.')}
            </p>

            <div className="input-group">
              <label className="input-label">{t('Static API Key (Header: x-api-key) *')}</label>
              <input 
                type="text"
                className="input-field font-mono"
                value={incomingApiKey}
                onChange={(e) => setIncomingApiKey(e.target.value)}
              />
              <span className="text-xs text-muted">{t('Valid Key issued to SpaceReserve:')} <code>sr_live_key_9981x40a9bc</code></span>
            </div>

            <div className="input-group">
              <label className="input-label">{t('Query Room Parameter (?location=) *')}</label>
              <input 
                type="text"
                className="input-field"
                value={incomingLocationQuery}
                onChange={(e) => setIncomingLocationQuery(e.target.value)}
                placeholder={t('e.g. Room 402 or Central Library')}
              />
            </div>

            <button 
              className="btn btn-primary w-full"
              onClick={handleRunIncomingSimulation}
              disabled={incomingLoading}
            >
              <Send size={16} />
              <span>{incomingLoading ? t('Processing Request...') : t('Simulate SpaceReserve Request')}</span>
            </button>
          </div>

          {/* Right: Finder Portal JSON Response */}
          <div className="glass-card peer-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Code2 size={18} className="text-purple" />
                <span>{t('Finder Portal JSON Output')}</span>
              </div>
              {incomingResponse && (
                <span className={`badge ${incomingResponse.statusCode === 200 ? 'badge-claimed' : 'badge-lost'}`}>
                  HTTP {incomingResponse.statusCode} {incomingResponse.statusText}
                </span>
              )}
            </div>

            {incomingResponse ? (
              <div className="json-response-container">
                <pre className="json-code-block">
                  {JSON.stringify(incomingResponse, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="empty-response-state">
                <Layers size={36} className="text-muted" />
                <div className="empty-title">{t('Awaiting Incoming Request')}</div>
                <p className="empty-desc">{t('Click "Simulate SpaceReserve Request" on the left to test the exposed API endpoint.')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
