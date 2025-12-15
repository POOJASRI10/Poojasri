import React, { useState } from 'react';
import { Upload, FileText, X, AlertCircle, FileType, Loader2 } from 'lucide-react';
import { CourseDocument } from '../types';

interface FileUploaderProps {
  documents: CourseDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<CourseDocument[]>>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ documents, setDocuments }) => {
  const [processing, setProcessing] = useState(false);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      // Dynamically import pdfjs-dist to avoid top-level import errors
      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
         pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // @ts-ignore
        const pageText = textContent.items.map((item) => item.str).join(' ');
        fullText += `\n--- Page ${i} ---\n${pageText}`;
      }
      return fullText;
    } catch (error) {
      console.error("PDF Parse Error", error);
      throw new Error("Failed to parse PDF. Please ensure it is a valid PDF file.");
    }
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    try {
      // Dynamically import mammoth
      // @ts-ignore
      const mammoth = (await import('mammoth')).default || await import('mammoth');
      
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error("DOCX Parse Error", error);
      throw new Error("Failed to parse Word document.");
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    setProcessing(true);
    const files: File[] = Array.from(e.target.files);
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
          // Try basic text fallback for other text types
          try {
            text = await file.text();
            // Basic binary check: look for null bytes
            if (text.includes('\0')) {
               console.warn(`File ${file.name} appears to be binary and is not a supported format.`);
               alert(`Skipped ${file.name}: Binary file format not supported. Please upload PDF, DOCX, or Text.`);
               continue; 
            }
          } catch (readErr) {
             console.warn("Could not read file as text", readErr);
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
    // Reset input
    e.target.value = '';
    setProcessing(false);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80 flex-shrink-0">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Materials
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload PDF, DOCX, or text files.
        </p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          processing 
            ? 'bg-gray-50 border-gray-300 cursor-not-allowed' 
            : 'border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50'
        }`}>
          {processing ? (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Loader2 className="w-8 h-8 mb-2 text-indigo-500 animate-spin" />
              <p className="text-sm text-gray-600 font-medium">Processing...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-indigo-500" />
              <p className="text-sm text-gray-600 font-medium">Click to upload</p>
              <p className="text-xs text-gray-400 mt-1">.pdf, .docx, .txt, .md</p>
            </div>
          )}
          <input 
            type="file" 
            className="hidden" 
            multiple 
            onChange={handleFileUpload} 
            accept=".pdf,.docx,.txt,.md,.json,.csv"
            disabled={processing}
          />
        </label>

        <div className="mt-6 space-y-3">
          {documents.length === 0 && !processing && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No documents yet.</p>
              <p className="text-xs mt-1">Upload materials to start learning.</p>
            </div>
          )}

          {documents.map(doc => {
            const isPdf = doc.name.toLowerCase().endsWith('.pdf');
            const isWord = doc.name.toLowerCase().endsWith('.docx');
            
            return (
              <div key={doc.id} className="group relative flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-all">
                <div className="h-10 w-10 bg-white rounded-md flex items-center justify-center border border-gray-200 text-gray-400">
                  {isPdf ? (
                    <FileType className="w-5 h-5 text-red-500" />
                  ) : isWord ? (
                    <FileType className="w-5 h-5 text-blue-500" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate" title={doc.name}>
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(doc.content.length / 1024) || '<1'} KB
                  </p>
                </div>
                <button 
                  onClick={() => removeDocument(doc.id)}
                  className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {documents.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <p>
            Gemini is processing {documents.length} file(s). Ask questions, summarize, or take a quiz!
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;