import React from 'react';
import { BookOpen, Calendar, CreditCard, Home, GraduationCap, Library, Landmark, Users } from 'lucide-react';

const SUGGESTIONS = [
  { id: 1, icon: <GraduationCap size={20} />, title: 'Admission Requirements', text: 'What are the admission requirements for B.Tech?' },
  { id: 2, icon: <Calendar size={20} />, title: 'Examination Schedule', text: 'When are the final exams scheduled for this semester?' },
  { id: 3, icon: <CreditCard size={20} />, title: 'Fee Structure', text: 'What is the fee structure for computer science?' },
  { id: 4, icon: <Home size={20} />, title: 'Hostel Information', text: 'How do I apply for a hostel room?' },
  { id: 5, icon: <Landmark size={20} />, title: 'Scholarship Details', text: 'What scholarships are available for international students?' },
  { id: 6, icon: <Library size={20} />, title: 'Library Services', text: 'What are the library opening hours?' },
  { id: 7, icon: <BookOpen size={20} />, title: 'Academic Calendar', text: 'Show me the academic calendar for 2024-2025.' },
  { id: 8, icon: <Users size={20} />, title: 'Department Information', text: 'Who is the Head of the Computer Science department?' }
];

const SuggestedQuestions = ({ onSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-8">
      <h3 className="text-sm font-medium text-slate-500 mb-4 px-1">Suggested Questions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SUGGESTIONS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.text)}
            className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all text-left group"
          >
            <div className="bg-primary-50 text-primary-600 p-2 rounded-lg group-hover:bg-primary-100 transition-colors">
              {item.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-1">{item.text}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
