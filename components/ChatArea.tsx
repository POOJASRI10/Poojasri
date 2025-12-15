import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, CourseDocument } from '../types';
import { generateChatResponse } from '../services/geminiService';

interface ChatAreaProps {
  documents: CourseDocument[];
}

const ChatArea: React.FC<ChatAreaProps> = ({ documents }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I am StudyMate AI. Upload your course materials on the left, and then ask me anything about them!',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await generateChatResponse(documents, messages, userMsg.text);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, modelMsg]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-cream/30 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-brand-primary text-white' 
                : 'bg-brand-gold text-white'
            }`}>
              {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm border ${
              msg.role === 'user' 
                ? 'bg-white border-brand-primary/10 text-brand-dark rounded-tr-none' 
                : 'bg-white border-brand-gold/30 text-brand-dark rounded-tl-none'
            }`}>
              <div className="prose prose-sm prose-red max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-start gap-4">
             <div className="w-10 h-10 rounded-full bg-brand-gold text-white flex items-center justify-center flex-shrink-0">
               <Bot className="w-6 h-6" />
             </div>
             <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-brand-gold/30 flex items-center gap-2 shadow-sm">
               <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
               <span className="text-sm text-brand-dark/70">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-brand-gold/30">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={documents.length > 0 ? "Ask a question about your materials..." : "Upload documents to start asking questions..."}
            className="w-full bg-brand-cream/30 border border-brand-gold/40 text-brand-dark text-sm rounded-xl focus:ring-brand-primary focus:border-brand-primary block p-4 pr-12 shadow-inner resize-none placeholder-brand-gold"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 text-brand-primary rounded-lg hover:bg-brand-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-brand-gold">StudyMate AI can make mistakes. Check important info.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;