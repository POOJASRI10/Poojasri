import React, { useState } from 'react';
import { Layers, RotateCw, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { CourseDocument, Flashcard } from '../types';
import { generateFlashcards } from '../services/geminiService';

interface FlashcardAreaProps {
  documents: CourseDocument[];
}

const FlashcardArea: React.FC<FlashcardAreaProps> = ({ documents }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerate = async () => {
    if (documents.length === 0) return;
    setLoading(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    
    const cards = await generateFlashcards(documents);
    setFlashcards(cards);
    setLoading(false);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white text-brand-dark/60 p-8 text-center">
        <Layers className="w-16 h-16 text-brand-gold/50 mb-4" />
        <h3 className="text-xl font-semibold text-brand-dark">No Content for Flashcards</h3>
        <p className="mt-2 max-w-md text-brand-gold">Upload course materials to generate flashcards.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-brand-gold/20 flex justify-between items-center bg-white/50 backdrop-blur-sm z-10">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-primary" />
            Flashcards
          </h2>
          <p className="text-sm text-brand-gold mt-1">
            Review key concepts one concept at a time.
          </p>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors shadow-sm font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              {flashcards.length > 0 ? <RefreshCw className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
              {flashcards.length > 0 ? 'New Deck' : 'Create Deck'}
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden p-8 bg-white flex flex-col items-center justify-center relative">
        
        {loading && (
           <div className="flex flex-col items-center justify-center text-brand-gold">
             <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
             <p className="text-brand-dark">Generating flashcards from your notes...</p>
           </div>
        )}

        {!loading && flashcards.length === 0 && (
          <div className="text-center text-brand-gold">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-gold/20 mx-auto">
              <Layers className="w-10 h-10 text-brand-primary" />
            </div>
            <p className="text-lg font-medium text-brand-dark">Ready to study?</p>
            <p className="max-w-sm text-center mt-2 text-sm">
              Click "Create Deck" to generate 10 flashcards based on your uploaded materials.
            </p>
          </div>
        )}

        {!loading && flashcards.length > 0 && (
          <div className="w-full max-w-2xl perspective-1000">
             {/* Progress Info */}
             <div className="text-center mb-4 text-brand-gold font-medium">
                Card {currentIndex + 1} of {flashcards.length}
             </div>

             {/* The Card */}
             <div 
               className="relative w-full h-80 cursor-pointer group [perspective:1000px]"
               onClick={handleFlip}
             >
                <div className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    
                    {/* Front Face */}
                    <div className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-md border border-brand-gold/20 p-8 flex flex-col items-center justify-center text-center [backface-visibility:hidden]">
                        <span className="text-xs uppercase tracking-widest text-brand-gold mb-4 font-bold">Front</span>
                        <p className="text-2xl font-bold text-brand-dark">{flashcards[currentIndex].front}</p>
                        <p className="text-xs text-brand-gold/50 mt-8 absolute bottom-4">Click to flip</p>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 w-full h-full bg-brand-primary rounded-2xl shadow-md border border-brand-primary p-8 flex flex-col items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <span className="text-xs uppercase tracking-widest text-brand-light/80 mb-4 font-bold">Back</span>
                        <p className="text-xl font-medium text-white">{flashcards[currentIndex].back}</p>
                    </div>
                </div>
             </div>

             {/* Controls */}
             <div className="flex items-center justify-center gap-6 mt-8">
               <button 
                 onClick={handlePrev} 
                 disabled={currentIndex === 0}
                 className="p-3 rounded-full bg-white border border-brand-gold/30 text-brand-dark hover:bg-brand-cream disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
               >
                 <ChevronLeft className="w-6 h-6" />
               </button>

               <button 
                 onClick={handleFlip}
                 className="flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-full hover:bg-black transition-all shadow-md"
               >
                 <RotateCw className="w-4 h-4" />
                 Flip Card
               </button>

               <button 
                 onClick={handleNext} 
                 disabled={currentIndex === flashcards.length - 1}
                 className="p-3 rounded-full bg-white border border-brand-gold/30 text-brand-dark hover:bg-brand-cream disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
               >
                 <ChevronRight className="w-6 h-6" />
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardArea;