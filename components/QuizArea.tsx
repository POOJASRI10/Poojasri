import React, { useState } from 'react';
import { Brain, CheckCircle, XCircle, ChevronRight, RefreshCw, Loader2, Award } from 'lucide-react';
import { CourseDocument, QuizQuestion, QuizResult } from '../types';
import { generateQuiz } from '../services/geminiService';

interface QuizAreaProps {
  documents: CourseDocument[];
}

const QuizArea: React.FC<QuizAreaProps> = ({ documents }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleGenerateQuiz = async () => {
    if (documents.length === 0) return;
    setLoading(true);
    setSubmitted(false);
    setUserAnswers([]);
    
    const generatedQuestions = await generateQuiz(documents);
    setQuestions(generatedQuestions);
    setUserAnswers(new Array(generatedQuestions.length).fill(-1));
    setLoading(false);
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    setSubmitted(true);
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-brand-cream/30 text-brand-dark/60 p-8 text-center">
        <Brain className="w-16 h-16 text-brand-gold/50 mb-4" />
        <h3 className="text-xl font-semibold text-brand-dark">No Content for Quiz</h3>
        <p className="mt-2 max-w-md text-brand-gold">Upload course materials to generate a practice quiz.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-brand-cream/30">
      <div className="p-6 border-b border-brand-gold/20 flex justify-between items-center bg-white/50 backdrop-blur-sm z-10">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
            <Brain className="w-6 h-6 text-brand-primary" />
            Practice Quiz
          </h2>
          <p className="text-sm text-brand-gold mt-1">
            Test your knowledge retention from the uploaded materials.
          </p>
        </div>
        
        <button
          onClick={handleGenerateQuiz}
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
              {questions.length > 0 ? <RefreshCw className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
              {questions.length > 0 ? 'New Quiz' : 'Start Quiz'}
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-brand-cream">
        {!loading && questions.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-brand-gold">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-gold/20">
              <Award className="w-10 h-10 text-brand-primary" />
            </div>
            <p className="text-lg font-medium text-brand-dark">Ready to test yourself?</p>
            <p className="max-w-sm text-center mt-2 text-sm">
              Click "Start Quiz" to generate 5 multiple-choice questions based on your notes.
            </p>
          </div>
        )}

        {loading && (
           <div className="h-full flex flex-col items-center justify-center text-brand-gold">
             <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
             <p className="text-brand-dark">Reading your notes and crafting questions...</p>
           </div>
        )}

        {!loading && questions.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-8 pb-12">
            
            {submitted && (
              <div className="bg-white p-6 rounded-xl border border-brand-primary/20 shadow-sm flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-brand-dark">Quiz Completed!</h3>
                  <p className="text-brand-gold">You scored {score} out of {questions.length}</p>
                </div>
                <div className="h-16 w-16 rounded-full border-4 border-brand-cream flex items-center justify-center bg-brand-primary text-white font-bold text-xl">
                  {Math.round((score / questions.length) * 100)}%
                </div>
              </div>
            )}

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-white p-6 rounded-xl shadow-sm border border-brand-gold/20">
                <h3 className="text-lg font-semibold text-brand-dark mb-4 flex gap-3">
                  <span className="text-brand-gold font-bold select-none">{qIdx + 1}.</span>
                  {q.question}
                </h3>
                
                <div className="space-y-3 pl-8">
                  {q.options.map((option, oIdx) => {
                    const isSelected = userAnswers[qIdx] === oIdx;
                    const isCorrect = q.correctAnswerIndex === oIdx;
                    
                    let className = "flex items-center p-3 rounded-lg border cursor-pointer transition-all ";
                    
                    if (submitted) {
                      if (isCorrect) className += "bg-green-50 border-green-200 text-green-800 ";
                      else if (isSelected && !isCorrect) className += "bg-red-50 border-red-200 text-red-800 ";
                      else className += "bg-white border-brand-gold/20 opacity-50 ";
                    } else {
                      if (isSelected) className += "bg-brand-cream border-brand-primary text-brand-primary ring-1 ring-brand-primary/20 ";
                      else className += "bg-white border-brand-gold/30 hover:border-brand-primary hover:bg-brand-cream/30 text-brand-dark ";
                    }

                    return (
                      <div 
                        key={oIdx} 
                        onClick={() => handleAnswerSelect(qIdx, oIdx)}
                        className={className}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                          isSelected || (submitted && isCorrect) ? 'border-transparent' : 'border-brand-gold/50'
                        }`}>
                          {submitted && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {submitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                          {!submitted && isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                        </div>
                        <span className="text-sm">{option}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {!submitted && (
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={userAnswers.includes(-1)}
                  className="px-8 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all transform active:scale-95"
                >
                  Submit Answers
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizArea;