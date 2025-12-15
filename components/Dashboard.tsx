import React, { useState } from 'react';
import { Upload, FileText, Brain, CircleHelp, BookOpen, Loader2, FileCheck, X, File as FileIcon } from 'lucide-react';
import { CourseDocument, AppTab } from '../types';
import { extractTextFromPdf, extractTextFromDocx } from '../utils/fileParser';

interface DashboardProps {
  documents: CourseDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<CourseDocument[]>>;
  onNavigate: (tab: AppTab) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ documents, setDocuments, onNavigate }) => {
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setProcessing(true);
    const newDocs: CourseDocument[] = [];

    for (const file of files) {
      try {
        let text = '';
        const fileType = file.name.toLowerCase();

        if (fileType.endsWith('.pdf')) {
          text = await extractTextFromPdf(file);
        } else if (fileType.endsWith('.docx')) {
          text = await extractTextFromDocx(file);
        } else if (fileType.endsWith('.txt') || fileType.endsWith('.md') || fileType.endsWith('.json') || fileType.endsWith('.csv')) {
          text = await file.text();
        } else {
          try {
            text = await file.text();
            if (text.includes('\0')) {
               console.warn(`File ${file.name} appears to be binary and is not a supported format.`);
               continue; 
            }
          } catch (readErr) {
             continue;
          }
        }

        if (text && text.trim()) {
          newDocs.push({
            id: Math.random().toString(36).substring(7),
            name: file.name,
            content: text,
            type: file.type || 'application/octet-stream',
            timestamp: Date.now()
          });
        }
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err);
        alert(`Failed to upload ${file.name}. Error: ${(err as Error).message}`);
      }
    }

    setDocuments(prev => [...prev, ...newDocs]);
    setProcessing(false);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const QuickActionCard = ({ 
    icon: Icon, 
    title, 
    description, 
    onClick,
    colorClass = "text-brand-primary"
  }: { 
    icon: any, 
    title: string, 
    description: string, 
    onClick: () => void,
    colorClass?: string
  }) => (
    <button 
      onClick={onClick}
      className="bg-white p-8 rounded-xl border border-brand-gold/20 shadow-sm hover:shadow-md hover:border-brand-primary transition-all text-left flex flex-col items-center text-center group"
    >
      <div className={`w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center mb-4 group-hover:bg-brand-primary/10 transition-colors`}>
        <Icon className={`w-8 h-8 ${colorClass}`} />
      </div>
      <h3 className="text-xl font-bold text-brand-dark mb-2 font-serif">{title}</h3>
      <p className="text-brand-gold text-sm">{description}</p>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-brand-dark mb-2">Study Materials</h1>
        <p className="text-brand-dark/70 text-lg">Upload your notes to unlock AI study tools.</p>
      </div>

      {/* Upload Area */}
      <div 
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ease-in-out ${
          dragActive 
            ? 'border-brand-primary bg-brand-primary/5' 
            : 'border-brand-primary/30 bg-brand-cream/30 hover:bg-brand-cream/50'
        }`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mb-2">
            {processing ? (
               <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            ) : (
               <Upload className="w-8 h-8 text-brand-primary" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-brand-dark font-serif">Upload Study Materials</h2>
          <p className="text-brand-gold font-medium">Drag & drop PDFs, Word docs, or PowerPoint files</p>
          <p className="text-sm text-brand-gold/70">or click to browse</p>
          
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            multiple
            onChange={handleChange}
            accept=".pdf,.docx,.txt,.md,.json,.csv"
            disabled={processing}
          />
        </div>
      </div>

      {/* Uploaded Files List */}
      {documents.length > 0 && (
        <div className="bg-white rounded-xl border border-brand-gold/20 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand-primary" />
            Uploaded Documents ({documents.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-brand-cream/30 rounded-lg border border-brand-gold/10 group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-brand-gold/20 flex-shrink-0">
                     <FileIcon className="w-5 h-5 text-brand-primary/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-dark truncate">{doc.name}</p>
                    <p className="text-xs text-brand-gold">{Math.round(doc.content.length / 1024) || '<1'} KB</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeDocument(doc.id)}
                  className="p-1.5 text-brand-gold hover:text-brand-primary hover:bg-brand-primary/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-brand-dark mb-6 border-b border-brand-gold/20 pb-2">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionCard 
            icon={FileText}
            title="Summarize"
            description="Get concise summaries"
            onClick={() => onNavigate(AppTab.SUMMARY)}
          />
          <QuickActionCard 
            icon={Brain}
            title="Generate Quiz"
            description="Test your knowledge"
            onClick={() => onNavigate(AppTab.QUIZ)}
          />
          <QuickActionCard 
            icon={CircleHelp}
            title="Explain Concept"
            description="Deep dive explanations"
            onClick={() => onNavigate(AppTab.CHAT)}
          />
          <QuickActionCard 
            icon={BookOpen}
            title="Flashcards"
            description="Create study cards"
            onClick={() => onNavigate(AppTab.FLASHCARDS)}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;