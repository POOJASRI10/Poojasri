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
      <div className="flex flex-col items-center justify-center h-full bg-white text-gray-500 p-8 text-center">
        <FileText className="w-16 h-16 text-gray-200 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">No Content to Summarize</h3>
        <p className="mt-2 max-w-md">Upload course materials in the sidebar to generate comprehensive summaries and study notes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Study Notes & Summary
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Condensed knowledge from {documents.length} document{documents.length !== 1 ? 's' : ''}.
          </p>
        </div>
        
        <button
          onClick={handleGenerateSummary}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm font-medium"
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

      <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
        {summary ? (
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="prose prose-lg prose-indigo max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-indigo-300" />
            </div>
            <p className="text-lg font-medium text-gray-500">Ready to summarize</p>
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