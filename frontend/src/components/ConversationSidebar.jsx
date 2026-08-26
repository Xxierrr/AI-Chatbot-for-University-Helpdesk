import React from 'react';
import { MessageSquare, Trash2, X } from 'lucide-react';

const ConversationSidebar = ({ 
  conversations, 
  currentId, 
  onSelect, 
  onDelete, 
  isOpen, 
  onClose 
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between md:hidden">
          <h2 className="font-semibold text-slate-800">History</h2>
          <button onClick={onClose} className="p-1 text-slate-500 hover:bg-slate-100 rounded-md">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-sm text-slate-500 text-center mt-10">No recent conversations</div>
          ) : (
            conversations.map((conv) => (
              <div 
                key={conv.id}
                className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                  currentId === conv.id 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
                onClick={() => onSelect(conv.id)}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <MessageSquare size={16} className={currentId === conv.id ? 'text-primary-600' : 'text-slate-400'} />
                  <span className="text-sm truncate font-medium">{conv.title || 'New Conversation'}</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ConversationSidebar;
