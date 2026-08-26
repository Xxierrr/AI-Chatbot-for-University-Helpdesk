import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ChatInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    handleInput();
  }, [message]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="relative flex items-end w-full bg-white border border-slate-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-400 transition-all">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled}
        placeholder="Ask about admissions, courses, exams, fees..."
        className="w-full max-h-[120px] py-3 pl-4 pr-12 bg-transparent resize-none outline-none text-sm text-slate-800 placeholder-slate-400 disabled:opacity-50"
        rows={1}
      />
      <button
        onClick={submit}
        disabled={!message.trim() || disabled}
        className="absolute right-2 bottom-2 p-1.5 bg-primary-600 text-white rounded-lg disabled:bg-slate-200 disabled:text-slate-400 hover:bg-primary-700 transition-colors"
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
};

export default ChatInput;
