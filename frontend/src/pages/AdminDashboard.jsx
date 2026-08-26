import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Files, 
  HelpCircle, 
  MessageSquare,
  Upload,
  Trash2,
  FileText,
  ArrowLeft
} from 'lucide-react';
import Header from '../components/Header';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  
  // State for various tabs
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Upload state
  const [file, setFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('admissions');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const res = await apiService.getAnalytics().catch(() => ({ 
          data: { total_conversations: 0, total_messages: 0, total_documents: 0, average_rating: 0, recent_conversations: [], top_questions: [] } 
        }));
        setStats(res.data);
      } else if (tab === 'documents') {
        const res = await apiService.getDocuments().catch(() => ({ data: [] }));
        setDocuments(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 'unanswered') {
        const res = await apiService.getUnanswered().catch(() => ({ data: [] }));
        setUnanswered(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 'feedback') {
        const res = await apiService.getFeedback().catch(() => ({ data: [] }));
        setFeedback(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file || !docTitle) return;
    
    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setUploadError("Invalid file type. Only PDF, DOCX, DOC, and TXT are allowed.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', docTitle);
    formData.append('category', docCategory);

    try {
      await apiService.uploadDocument(formData);
      setFile(null);
      setDocTitle('');
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      fetchData('documents');
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await apiService.deleteDocument(id);
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Admin Panel</h2>
          </div>
          <nav className="p-3 space-y-1 flex-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'documents' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Files size={18} /> Documents
            </button>
            <button 
              onClick={() => setActiveTab('unanswered')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'unanswered' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <HelpCircle size={18} /> Unanswered
            </button>
            <button 
              onClick={() => setActiveTab('feedback')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'feedback' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <MessageSquare size={18} /> Feedback
            </button>
          </nav>
          <div className="p-3 border-t border-slate-200">
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={18} /> Back to Chat
            </button>
          </div>
        </div>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20 flex">
          {[
            { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { key: 'documents', icon: Files, label: 'Docs' },
            { key: 'unanswered', icon: HelpCircle, label: 'Unanswered' },
            { key: 'feedback', icon: MessageSquare, label: 'Feedback' },
          ].map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${activeTab === tab.key ? 'text-primary-600' : 'text-slate-500'}`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto">
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && stats && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500 mb-1">Conversations</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.total_conversations || 0}</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500 mb-1">Messages</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.total_messages || 0}</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500 mb-1">Documents</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.total_documents || 0}</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500 mb-1">Avg Rating</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.average_rating || 0}<span className="text-lg text-slate-400">/5</span></p>
                      </div>
                    </div>

                    {/* Feedback Summary */}
                    {stats.feedback_summary && (
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 mb-3">Feedback Summary</h3>
                        <div className="flex gap-6">
                          <div className="flex items-center gap-2">
                            <span className="text-green-500">👍</span>
                            <span className="text-sm text-slate-600">Positive: <strong>{stats.feedback_summary.positive}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-500">😐</span>
                            <span className="text-sm text-slate-600">Neutral: <strong>{stats.feedback_summary.neutral}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-red-500">👎</span>
                            <span className="text-sm text-slate-600">Negative: <strong>{stats.feedback_summary.negative}</strong></span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top Questions */}
                    {stats.top_questions && stats.top_questions.length > 0 && (
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 mb-3">Recent Questions</h3>
                        <ul className="space-y-2">
                          {stats.top_questions.map((q, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-primary-500 font-mono text-xs mt-0.5">{i + 1}.</span>
                              <span className="truncate">{q.content}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* DOCUMENTS TAB */}
                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Knowledge Base</h2>
                    
                    {/* Upload Form */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-semibold text-slate-800 mb-4">Add New Document</h3>
                      <form onSubmit={handleFileUpload} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                            <input 
                              type="text" 
                              required
                              value={docTitle}
                              onChange={(e) => setDocTitle(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                              placeholder="e.g. 2024 Fee Structure"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select 
                              value={docCategory}
                              onChange={(e) => setDocCategory(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            >
                              <option value="admissions">Admissions</option>
                              <option value="academics">Academics</option>
                              <option value="finance">Finance / Fees</option>
                              <option value="facilities">Facilities / Hostel</option>
                              <option value="examinations">Examinations</option>
                              <option value="scholarships">Scholarships</option>
                              <option value="library">Library</option>
                              <option value="placement">Placement</option>
                              <option value="general">General</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
                          <input 
                            type="file" 
                            required
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                          />
                          {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
                        </div>
                        
                        <button 
                          type="submit" 
                          disabled={uploading || !file || !docTitle}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                          {uploading ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</>
                          ) : (
                            <><Upload size={16} /> Upload Document</>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Documents List */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Chunks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {documents.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-500">No documents uploaded yet. Upload documents to build the knowledge base.</td></tr>
                          ) : (
                            documents.map((doc) => (
                              <tr key={doc.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-primary-500" />
                                    <span className="text-sm font-medium text-slate-900">{doc.title}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{doc.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    doc.status === 'ready' ? 'bg-green-100 text-green-700' : 
                                    doc.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {doc.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{doc.chunk_count || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                  {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button onClick={() => handleDeleteDoc(doc.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete document">
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* UNANSWERED TAB */}
                {activeTab === 'unanswered' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Unanswered Questions</h2>
                    <p className="text-sm text-slate-500">These are questions the bot couldn't answer confidently. Upload relevant documents to cover these topics.</p>
                    
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <ul className="divide-y divide-slate-200">
                        {unanswered.length === 0 ? (
                          <li className="px-6 py-8 text-center text-sm text-slate-500">No unanswered questions found. Great job! 🎉</li>
                        ) : (
                          unanswered.map((q, i) => (
                            <li key={q.id || i} className="p-4 hover:bg-slate-50">
                              <p className="text-sm font-medium text-slate-900">{q.content}</p>
                              <span className="text-xs text-slate-500 mt-1 block">
                                {q.timestamp ? new Date(q.timestamp).toLocaleDateString() : ''}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* FEEDBACK TAB */}
                {activeTab === 'feedback' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">User Feedback</h2>
                    
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <ul className="divide-y divide-slate-200">
                        {feedback.length === 0 ? (
                          <li className="px-6 py-8 text-center text-sm text-slate-500">No feedback received yet</li>
                        ) : (
                          feedback.map((f, i) => (
                            <li key={f.id || i} className="p-4 hover:bg-slate-50 flex items-start gap-3">
                              <div className={`mt-0.5 px-2 py-1 rounded text-sm font-medium ${
                                f.rating >= 4 ? 'bg-green-50 text-green-600' : 
                                f.rating <= 2 ? 'bg-red-50 text-red-600' : 
                                'bg-yellow-50 text-yellow-600'
                              }`}>
                                {f.rating >= 4 ? '👍' : f.rating <= 2 ? '👎' : '😐'} {f.rating}/5
                              </div>
                              <div className="flex-1 min-w-0">
                                {f.comment && <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{f.comment}</p>}
                                <span className="text-xs text-slate-500 mt-1 block">
                                  Message #{f.message_id} • {f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}
                                </span>
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
