import React, { useState } from 'react';
import { MessageSquare, FileText, Brain, GraduationCap } from 'lucide-react';
import FileUploader from './components/FileUploader';
import ChatArea from './components/ChatArea';
import SummaryArea from './components/SummaryArea';
import QuizArea from './components/QuizArea';
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
      default:
        return <ChatArea documents={documents} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Left Sidebar - File Manager */}
      <FileUploader documents={documents} setDocuments={setDocuments} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navigation Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-lg font-bold text-gray-900 tracking-tight">Smart Campus</h1>
               <p className="text-xs text-gray-500">AI Learning Assistant</p>
             </div>
          </div>
          
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab(AppTab.CHAT)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === AppTab.CHAT 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Q&A
            </button>
            <button
              onClick={() => setActiveTab(AppTab.SUMMARY)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === AppTab.SUMMARY
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              Summarize
            </button>
            <button
              onClick={() => setActiveTab(AppTab.QUIZ)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === AppTab.QUIZ
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Brain className="w-4 h-4" />
              Quiz
            </button>
          </div>
          
          <div className="w-8"></div> {/* Spacer for balance */}
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-hidden relative">
           {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;