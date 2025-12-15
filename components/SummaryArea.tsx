import React, { useState } from 'react';
import { FileText, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CourseDocument } from '../types';
import { generateSummary } from '../services/geminiService';

interface SummaryAreaProps {
  documents: CourseDocument[];
}

const SummaryArea: React.FC<SummaryAreaProps> = ({ documents }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateSummary = async () => {
    if (documents.length === 0) return;
    setLoading(true);
    const result = await generateSummary(documents);
    setSummary(result);
    setLoading(false);
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white text-brand-dark/60 p-8 text-center">
        <FileText className="w-16 h-16 text-brand-gold/50 mb-4" />
        <h3 className="text-xl font-semibold text-brand-dark">No Content to Summarize</h3>
        <p className="mt-2 max-w-md text-brand-gold">Upload course materials in the sidebar to generate comprehensive summaries and study notes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-brand-gold/20 flex justify-between items-center bg-white/50 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-gold" />
            Study Notes & Summary
          </h2>
          <p className="text-sm text-brand-gold mt-1">
            Condensed knowledge from {documents.length} document{documents.length !== 1 ? 's' : ''}.
          </p>
        </div>
        
        <button
          onClick={handleGenerateSummary}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors shadow-sm font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            <>
              {summary ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {summary ? 'Regenerate' : 'Generate Summary'}
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-white">
        {summary ? (
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-brand-gold/20">
            <div className="prose prose-lg prose-red max-w-none text-brand-dark">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-brand-gold">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-gold/20">
              <FileText className="w-10 h-10 text-brand-primary" />
            </div>
            <p className="text-lg font-medium text-brand-dark">Ready to summarize</p>
            <p className="max-w-sm text-center mt-2 text-sm">
              Click the "Generate Summary" button to create an organized study guide from your uploaded files.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryArea;