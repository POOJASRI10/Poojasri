import React, { useState } from 'react';
import { MessageSquare, FileText, Brain, GraduationCap, Layers } from 'lucide-react';
import FileUploader from './components/FileUploader';
import ChatArea from './components/ChatArea';
import SummaryArea from './components/SummaryArea';
import QuizArea from './components/QuizArea';
import FlashcardArea from './components/FlashcardArea';
import { AppTab, CourseDocument } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CHAT);
  const [documents, setDocuments] = useState<CourseDocument[]>([]);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.CHAT:
        return <ChatArea documents={documents} />;
      case AppTab.SUMMARY:
        return <SummaryArea documents={documents} />;
      case AppTab.QUIZ:
        return <QuizArea documents={documents} />;
      case AppTab.FLASHCARDS:
        return <FlashcardArea documents={documents} />;
      default:
        return <ChatArea documents={documents} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-cream overflow-hidden font-sans text-brand-dark">
      {/* Left Sidebar - File Manager */}
      <FileUploader documents={documents} setDocuments={setDocuments} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navigation Bar */}
        <div className="h-16 bg-white border-b border-brand-gold/30 flex items-center justify-between px-6 shadow-sm z-20">
          <div className="flex items-center gap-3">
             <div className="bg-brand-primary p-2 rounded-lg shadow-sm">
                <GraduationCap className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-lg font-bold text-brand-dark tracking-tight">StudyMate AI</h1>
               <p className="text-xs text-brand-gold font-medium">AI Learning Assistant</p>
             </div>
          </div>
          
          <div className="flex p-1 bg-brand-cream rounded-lg border border-brand-gold/20">
            <button
              onClick={() => setActiveTab(AppTab.CHAT)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === AppTab.CHAT 
                  ? 'bg-white text-brand-primary shadow-sm ring-1 ring-brand-gold/20' 
                  : 'text-brand-dark/60 hover:text-brand-primary hover:bg-white/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Q&A
            </button>
            <button
              onClick={() => setActiveTab(AppTab.SUMMARY)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === AppTab.SUMMARY
                  ? 'bg-white text-brand-primary shadow-sm ring-1 ring-brand-gold/20' 
                  : 'text-brand-dark/60 hover:text-brand-primary hover:bg-white/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Summarize
            </button>
            <button
              onClick={() => setActiveTab(AppTab.QUIZ)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === AppTab.QUIZ
                  ? 'bg-white text-brand-primary shadow-sm ring-1 ring-brand-gold/20' 
                  : 'text-brand-dark/60 hover:text-brand-primary hover:bg-white/50'
              }`}
            >
              <Brain className="w-4 h-4" />
              Quiz
            </button>
            <button
              onClick={() => setActiveTab(AppTab.FLASHCARDS)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === AppTab.FLASHCARDS
                  ? 'bg-white text-brand-primary shadow-sm ring-1 ring-brand-gold/20' 
                  : 'text-brand-dark/60 hover:text-brand-primary hover:bg-white/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Flashcards
            </button>
          </div>
          
          <div className="w-8"></div> {/* Spacer for balance */}
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-hidden relative bg-brand-cream">
           {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;