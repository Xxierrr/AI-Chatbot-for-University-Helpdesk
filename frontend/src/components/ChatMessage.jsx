import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, ChevronDown, ChevronRight } from 'lucide-react';
import FeedbackButtons from './FeedbackButtons';

const ChatMessage = ({ message, isBot, isTyping }) => {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  
  if (isTyping) {
    return (
      <div className="flex w-full mb-6 justify-start">
        <div className="flex max-w-[85%] md:max-w-[75%]">
          <div className="flex-shrink-0 mr-3 mt-1 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
            <Bot size={18} />
          </div>
          <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isBot ? 'mr-3' : 'ml-3'} mt-1 h-8 w-8 rounded-full flex items-center justify-center ${isBot ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-600'}`}>
          {isBot ? <Bot size={18} /> : <User size={18} />}
        </div>
        
        {/* Message Bubble */}
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <div 
            className={`px-5 py-3.5 shadow-sm text-sm ${
              isBot 
                ? 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm' 
                : 'bg-primary-600 text-white rounded-2xl rounded-tr-sm'
            }`}
          >
            <div className={`prose prose-sm max-w-none ${isBot ? 'prose-slate' : 'prose-invert'}`}>
              <ReactMarkdown>{message.content || message.message || ''}</ReactMarkdown>
            </div>
            
            {/* Sources Accordion */}
            {isBot && message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button 
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors"
                >
                  {sourcesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  Sources ({message.sources.length})
                </button>
                
                {sourcesOpen && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {message.sources.map((src, i) => (
                      <a 
                        key={i} 
                        href={src.url || '#'} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-md text-slate-600 hover:border-primary-200 hover:bg-primary-50 transition-colors block truncate"
                        title={src.title || src}
                      >
                        📄 {src.title || src}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className={`flex items-center gap-3 mt-1.5 px-1 ${isBot ? 'justify-start' : 'justify-end'} w-full`}>
            <span className="text-[10px] text-slate-400 font-medium">
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isBot && message.id && <FeedbackButtons messageId={message.id} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
