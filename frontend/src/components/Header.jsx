import React from 'react';
import { GraduationCap, MessageSquarePlus, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onNewChat }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="bg-primary-600 p-2 rounded-lg text-white">
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">University Helpdesk</h1>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">AI-Powered Campus Assistant</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {onNewChat && (
          <button 
            onClick={onNewChat}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <MessageSquarePlus size={18} />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}
        
        {user ? (
          <div className="flex items-center gap-3 ml-2 border-l border-slate-200 pl-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-slate-700">{user.name}</span>
              <span className="text-xs text-slate-500 capitalize">{user.role}</span>
            </div>
            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                title="Admin Dashboard"
              >
                <User size={20} />
              </button>
            )}
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition-colors ml-2"
          >
            <User size={18} />
            <span className="hidden sm:inline">Login</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
