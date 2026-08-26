import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import ConversationSidebar from '../components/ConversationSidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import SuggestedQuestions from '../components/SuggestedQuestions';
import { Menu, GraduationCap, AlertCircle, RefreshCw } from 'lucide-react';
import apiService from '../services/api';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const res = await apiService.getConversations().catch(() => ({ data: [] }));
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversation = async (id) => {
    try {
      setError(null);
      setCurrentId(id);
      setSidebarOpen(false);
      const res = await apiService.getConversation(id);
      // Backend returns array of messages directly
      const msgs = Array.isArray(res.data) ? res.data : (res.data?.messages || []);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
      setError('Failed to load conversation');
    }
  };

  const handleNewChat = () => {
    setCurrentId(null);
    setMessages([]);
    setError(null);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = async (id) => {
    try {
      await apiService.deleteConversation(id).catch(() => {});
      setConversations(conversations.filter(c => c.id !== id));
      if (currentId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    setError(null);
    
    // Add user message to UI immediately
    const userMsg = {
      id: `temp-${Date.now()}`,
      content: text,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await apiService.sendMessage(text, currentId);
      const data = res.data;
      
      // Update conversation ID if this is a new conversation
      if (data.conversation_id && !currentId) {
        setCurrentId(data.conversation_id);
        loadConversations();
      }
      
      // Add bot message from response
      const botMsg = {
        id: data.message?.id,
        content: data.message?.content,
        role: 'assistant',
        sources: data.message?.sources || [],
        timestamp: data.message?.timestamp || new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setError('Failed to send message. Please try again.');
      // Add error message as bot response
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        role: 'assistant',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden relative">
      <Header onNewChat={handleNewChat} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <ConversationSidebar 
          conversations={conversations}
          currentId={currentId}
          onSelect={loadConversation}
          onDelete={handleDeleteConversation}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Toggle sidebar button (mobile) */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="md:hidden absolute top-4 left-4 z-10 p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Menu size={20} />
        </button>

        <main className="flex-1 flex flex-col h-full bg-slate-50/50 relative max-w-5xl mx-auto w-full">
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center pt-8 pb-12">
                <div className="bg-primary-100 p-4 rounded-2xl text-primary-600 mb-6">
                  <GraduationCap size={48} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 text-center">
                  👋 Welcome to University Helpdesk
                </h2>
                <p className="text-slate-500 text-center max-w-lg mb-8">
                  Your AI-powered campus assistant. Ask me anything about admissions, courses, exams, fees, hostel, library, or campus life.
                </p>
                <SuggestedQuestions onSelect={handleSendMessage} />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full pb-6">
                {messages.map((msg, idx) => (
                  <ChatMessage 
                    key={msg.id || idx} 
                    message={msg} 
                    isBot={msg.role === 'assistant'} 
                  />
                ))}
                {isTyping && <ChatMessage isBot={true} isTyping={true} />}
                
                {error && (
                  <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 max-w-md mx-auto">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="p-4 bg-transparent w-full">
            <div className="max-w-4xl mx-auto">
              <ChatInput onSend={handleSendMessage} disabled={isTyping} />
              <div className="text-center mt-3">
                <span className="text-[10px] text-slate-400">
                  AI responses may not always be 100% accurate. Please verify important information.
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
