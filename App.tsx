import React, { useState } from 'react';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ChatArea from './components/ChatArea';
import SummaryArea from './components/SummaryArea';
import QuizArea from './components/QuizArea';
import FlashcardArea from './components/FlashcardArea';
import { AppTab, CourseDocument } from './types';

// New interface for the main app view state
enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TOOL = 'TOOL'
}

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CHAT);
  const [viewState, setViewState] = useState<ViewState>(ViewState.DASHBOARD);
  const [documents, setDocuments] = useState<CourseDocument[]>([]);

  const handleNavigate = (tab: AppTab) => {
    setActiveTab(tab);
    setViewState(ViewState.TOOL);
  };

  const handleBackToDashboard = () => {
    setViewState(ViewState.DASHBOARD);
  };

  const renderContent = () => {
    if (viewState === ViewState.DASHBOARD) {
      return (
        <Dashboard 
          documents={documents} 
          setDocuments={setDocuments} 
          onNavigate={handleNavigate} 
        />
      );
    }

    // Tool View Layout
    const renderTool = () => {
      switch (activeTab) {
        case AppTab.CHAT: return <ChatArea documents={documents} />;
        case AppTab.SUMMARY: return <SummaryArea documents={documents} />;
        case AppTab.QUIZ: return <QuizArea documents={documents} />;
        case AppTab.FLASHCARDS: return <FlashcardArea documents={documents} />;
        default: return <ChatArea documents={documents} />;
      }
    };

    const getToolTitle = () => {
       switch (activeTab) {
        case AppTab.CHAT: return 'Explain Concept';
        case AppTab.SUMMARY: return 'Summarize';
        case AppTab.QUIZ: return 'Generate Quiz';
        case AppTab.FLASHCARDS: return 'Flashcards';
        default: return 'Study Tool';
      }
    };

    return (
      <div className="flex flex-col h-screen">
        {/* Tool Header */}
        <div className="h-16 bg-white border-b border-brand-gold/30 flex items-center justify-between px-6 shadow-sm z-20 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackToDashboard}
              className="p-2 hover:bg-gray-100 rounded-full text-brand-dark transition-colors flex items-center gap-2 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
            <div className="h-6 w-px bg-brand-gold/30 mx-2"></div>
            <h2 className="text-xl font-bold text-brand-dark font-serif">{getToolTitle()}</h2>
          </div>
          
          <div className="flex items-center gap-2 text-brand-gold">
             <GraduationCap className="w-5 h-5" />
             <span className="text-sm font-medium">StudyMate AI</span>
          </div>
        </div>

        {/* Tool Content */}
        <div className="flex-1 overflow-hidden relative bg-white">
           {renderTool()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-brand-dark">
      {viewState === ViewState.DASHBOARD ? (
        <div className="min-h-screen overflow-y-auto">
           {/* Simple Header for Dashboard */}
           <div className="h-16 flex items-center px-8 border-b border-brand-gold/10 bg-white/50 backdrop-blur-sm sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <div className="bg-brand-primary p-1.5 rounded-lg shadow-sm">
                    <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-brand-dark tracking-tight">StudyMate AI</span>
              </div>
           </div>
           {renderContent()}
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
}

export default App;