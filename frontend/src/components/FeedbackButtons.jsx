import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import apiService from '../services/api';

const FeedbackButtons = ({ messageId }) => {
  const [status, setStatus] = useState(null); // 'up', 'down', 'submitted'
  const [comment, setComment] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAction = (type) => {
    setStatus(type);
    setShowInput(true);
  };

  const submit = async () => {
    try {
      await apiService.submitFeedback(messageId, status === 'up' ? 5 : 1, comment);
      setStatus('submitted');
      setShowInput(false);
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  if (status === 'submitted') {
    return <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">✓ Feedback received</div>;
  }

  return (
    <div className="mt-2 flex flex-col items-start gap-2">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleAction('up')}
          className={`p-1.5 rounded hover:bg-slate-100 text-slate-400 transition-colors ${status === 'up' ? 'text-primary-600 bg-primary-50' : ''}`}
          title="Helpful"
        >
          <ThumbsUp size={14} />
        </button>
        <button 
          onClick={() => handleAction('down')}
          className={`p-1.5 rounded hover:bg-slate-100 text-slate-400 transition-colors ${status === 'down' ? 'text-red-600 bg-red-50' : ''}`}
          title="Not Helpful"
        >
          <ThumbsDown size={14} />
        </button>
      </div>
      
      {showInput && (
        <div className="flex items-center gap-2 mt-1 w-full max-w-xs">
          <input 
            type="text" 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional feedback..."
            className="flex-1 text-xs px-2 py-1.5 border border-slate-200 rounded outline-none focus:border-primary-400 bg-white text-slate-800"
          />
          <button 
            onClick={submit}
            className="text-xs px-2 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackButtons;
