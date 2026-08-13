import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  PlusCircle, 
  Send,
  Loader2,
  CheckCircle,
  Image as ImageIcon
} from './Icons';
import { ITEM_CATEGORIES, simulateGeminiAiAnalysis } from '../services/store';

export default function ReportModal({
  isOpen,
  onClose,
  initialType = 'FOUND',
  currentUser,
  onSubmitItem
}) {
  if (!isOpen) return null;

  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('Room 402 (Engineering Building)');
  const [customLocation, setCustomLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [aiTags, setAiTags] = useState([]);
  
  // AI State
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  const samplePhotoPresets = [
    { label: 'MacBook', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' },
    { label: 'Headphones', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80' },
    { label: 'Leather Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80' },
    { label: 'Keys Set', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80' },
    { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80' },
    { label: 'Student ID', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80' }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!title && !description) {
      alert('Please enter a brief item name or description for Gemini AI to analyze.');
      return;
    }

    setIsAiAnalyzing(true);
    setAiSuccessMessage('');

    try {
      const result = await simulateGeminiAiAnalysis(title + ' ' + description);
      setCategory(result.category);
      if (!title) setTitle(result.suggestedTitle);
      setAiTags(result.tags);
      setAiSuccessMessage(`Gemini AI classified this as "${result.category}" (${Math.round(result.confidence * 100)}% confidence)`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalLocation = location === 'Other Custom Location' ? customLocation : location;

    const newItem = {
      id: `item-${Date.now()}`,
      type,
      title: title.trim(),
      description: description.trim(),
      category,
      location: finalLocation || 'Campus Common Area',
      date: new Date().toISOString(),
      photoUrl: photoUrl.trim() || 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&auto=format&fit=crop&q=80',
      status: 'OPEN',
      reportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email
      },
      aiTags: aiTags.length > 0 ? aiTags : ['Campus', category],
      claims: []
    };

    onSubmitItem(newItem);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card report-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">
              {type === 'FOUND' ? 'Report a Found Item' : 'Report a Lost Item'}
            </h2>
            <p className="modal-sub">
              {type === 'FOUND' 
                ? 'Log an item you picked up on campus so the owner can claim it.' 
                : 'Broadcast details about something you lost on campus.'}
            </p>
          </div>
          <button className="icon-btn close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body modal-scrollable">
            {/* Type Switcher Segmented Control */}
            <div className="report-type-toggle-row">
              <button
                type="button"
                className={`type-toggle-btn ${type === 'FOUND' ? 'active-found' : ''}`}
                onClick={() => setType('FOUND')}
              >
                <PlusCircle size={18} />
                <span>I Found Something</span>
              </button>
              <button
                type="button"
                className={`type-toggle-btn ${type === 'LOST' ? 'active-lost' : ''}`}
                onClick={() => setType('LOST')}
              >
                <AlertCircle size={18} />
                <span>I Lost Something</span>
              </button>
            </div>

            {/* AI Assistant Banner */}
            <div className="ai-assistant-card glass-card">
              <div className="ai-card-left">
                <div className="ai-sparkle-box">
                  <Sparkles size={20} className="text-purple" />
                </div>
                <div>
                  <div className="ai-card-title">Google Gemini Auto-Categorization</div>
                  <div className="ai-card-desc">Type your description, then click analyze to suggest categories and tags automatically.</div>
                </div>
              </div>
              <button 
                type="button"
                className="btn btn-primary btn-sm ai-analyze-btn"
                onClick={handleRunAiAnalysis}
                disabled={isAiAnalyzing}
              >
                {isAiAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Analyze with AI</span>
                  </>
                )}
              </button>
            </div>

            {aiSuccessMessage && (
              <div className="ai-success-pill">
                <CheckCircle size={16} className="text-emerald" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}

            {/* Item Title Input */}
            <div className="input-group">
              <label className="input-label">Item Name / Headline *</label>
              <input 
                type="text"
                className="input-field"
                placeholder="e.g. Apple MacBook Pro 14 inch or Leather Wallet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category & Location Grid */}
            <div className="form-two-col">
              <div className="input-group">
                <label className="input-label">Category *</label>
                <select 
                  className="select-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {ITEM_CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Location on Campus *</label>
                <select 
                  className="select-field"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="Cathedral of Learning (CL Building)">Cathedral of Learning (CL Building)</option>
                  <option value="Room 402 (Engineering Building)">Room 402 (Engineering Building)</option>
                  <option value="John Paul II Sports Center">John Paul II Sports Center</option>
                  <option value="Central Library (3rd Floor)">Central Library (3rd Floor)</option>
                  <option value="Library Room 4B / Study Pod">Library Room 4B / Study Pod</option>
                  <option value="Campus Cafeteria (AU Mall)">Campus Cafeteria (AU Mall)</option>
                  <option value="Martin de Tours Hall (MSME)">Martin de Tours Hall (MSME)</option>
                  <option value="Other Custom Location">Other Custom Location</option>
                </select>
              </div>
            </div>

            {location === 'Other Custom Location' && (
              <div className="input-group">
                <label className="input-label">Specify Custom Location</label>
                <input 
                  type="text"
                  className="input-field"
                  placeholder="e.g. Student Union Hallway, 2nd floor"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                />
              </div>
            )}

            {/* Detailed Description */}
            <div className="input-group">
              <label className="input-label">Description & Identifying Characteristics *</label>
              <textarea 
                className="textarea-field"
                placeholder="Provide accurate visual details: color, model, stickers, or condition..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Photo Input (File Upload or Presets) */}
            <div className="input-group">
              <label className="input-label">Photo Upload or Presets</label>
              
              <div className="file-upload-wrapper">
                <input 
                  type="file" 
                  accept="image/*"
                  id="photo-upload-input"
                  className="file-input-hidden"
                  onChange={handleFileUpload}
                />
                <label htmlFor="photo-upload-input" className="file-upload-btn btn btn-glass btn-sm">
                  <ImageIcon size={16} />
                  <span>Choose Image</span>
                </label>
              </div>

              {photoUrl && (
                <div className="upload-preview-box">
                  <img src={photoUrl} alt="Preview" className="upload-preview-img" />
                  <button 
                    type="button" 
                    className="clear-photo-btn"
                    onClick={() => setPhotoUrl('')}
                  >
                    Remove Photo
                  </button>
                </div>
              )}
              
              <div className="photo-presets-row">
                <span className="preset-label">Or Pick Preset:</span>
                {samplePhotoPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="preset-btn"
                    onClick={() => setPhotoUrl(preset.url)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-glass" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={16} />
              <span>Publish {type === 'FOUND' ? 'Found Item' : 'Lost Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
