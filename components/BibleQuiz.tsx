import React, { useState, useEffect } from 'react';
import { UserPreferences, QuizQuestion } from '../types';
import { generateDailyQuiz } from '../services/geminiService';
import { getText } from '../constants';
import { Loader2, CheckCircle, XCircle, Trophy, BookOpen, BrainCircuit } from 'lucide-react';

interface Props {
  prefs: UserPreferences;
}

const STORAGE_KEY = 'bible_ai_daily_quiz_status';

interface QuizStatus {
    date: string;
    score: number;
    played: boolean;
}

const BibleQuiz: React.FC<Props> = ({ prefs }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [quizState, setQuizState] = useState<'INTRO' | 'PLAYING' | 'FINISHED' | 'ALREADY_PLAYED'>('INTRO');
  const [todayScore, setTodayScore] = useState(0);

  const t = getText(prefs.language).quiz;

  useEffect(() => {
    // Check local storage for today's status
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
        try {
            const status: QuizStatus = JSON.parse(stored);
            if (status.date === today && status.played) {
                setQuizState('ALREADY_PLAYED');
                setTodayScore(status.score);
            }
        } catch (e) {
            console.error("Error parsing quiz status");
        }
    }
  }, []);

  const handleStart = async () => {
    setLoading(true);
    const response = await generateDailyQuiz(prefs);
    if (response.questions && response.questions.length > 0) {
        setQuestions(response.questions);
        setQuizState('PLAYING');
        setCurrentQIndex(0);
        setScore(0);
    } else {
        alert("Could not generate quiz. Please try again.");
    }
    setLoading(false);
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswerRevealed) return;
    setSelectedOption(index);
    setIsAnswerRevealed(true);

    const isCorrect = index === questions[currentQIndex].correctIndex;
    if (isCorrect) {
        setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswerRevealed(false);
    } else {
        handleFinish();
    }
  };

  const handleFinish = () => {
    const today = new Date().toISOString().split('T')[0];
    const finalScore = score + (selectedOption === questions[currentQIndex].correctIndex ? 0 : 0); // Score is already updated in handleOptionSelect
    
    // Determine final score logic carefully (score is state, updated immediately on click)
    // We just save the current score state
    const status: QuizStatus = {
        date: today,
        score: score,
        played: true
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
    setQuizState('FINISHED');
  };

  // Render Intro
  if (quizState === 'INTRO') {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8 animate-fade-in">
            <div className="w-24 h-24 bg-bible-100 rounded-full flex items-center justify-center text-bible-600 mb-6 shadow-sm">
                <BrainCircuit size={48} />
            </div>
            <h2 className="text-4xl font-serif font-bold text-bible-900 mb-4">{t.title}</h2>
            <p className="text-bible-600 max-w-md mx-auto mb-8 text-lg">
                Test your knowledge of scripture with 10 daily questions based on the {prefs.bibleVersion}.
            </p>
            <button 
                onClick={handleStart}
                disabled={loading}
                className="px-8 py-4 bg-bible-600 text-white rounded-xl hover:bg-bible-700 transition-all font-semibold shadow-lg text-lg flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Trophy size={20} />}
                {loading ? t.loading : t.startBtn}
            </button>
        </div>
    );
  }

  // Render Already Played
  if (quizState === 'ALREADY_PLAYED') {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8 animate-fade-in">
             <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-sm">
                <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-bible-900 mb-2">{t.alreadyPlayed}</h2>
            <p className="text-xl text-bible-800 mb-6 font-medium">{t.scoreDesc}: {todayScore} / 10</p>
            <p className="text-bible-500 max-w-md mx-auto bg-bible-50 p-4 rounded-lg border border-bible-100">
                {t.comeBack}
            </p>
        </div>
    );
  }

  // Render Finished
  if (quizState === 'FINISHED') {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8 animate-fade-in">
             <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-6 shadow-sm">
                <Trophy size={48} />
            </div>
            <h2 className="text-4xl font-serif font-bold text-bible-900 mb-4">{t.scoreTitle}</h2>
            <div className="text-6xl font-bold text-bible-800 mb-4">{score} <span className="text-3xl text-bible-400">/ 10</span></div>
            <p className="text-bible-600 mb-8">{t.comeBack}</p>
        </div>
    );
  }

  // Render Game Loop
  const currentQ = questions[currentQIndex];
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 h-full flex flex-col justify-center">
        {/* Header / Progress */}
        <div className="flex justify-between items-end mb-6">
            <span className="text-sm font-bold text-bible-500 uppercase tracking-wider">{t.question} {currentQIndex + 1} / 10</span>
            <span className="text-sm font-bold text-bible-800 bg-bible-100 px-3 py-1 rounded-full">Score: {score}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-bible-100 rounded-full mb-8 overflow-hidden">
            <div 
                className="h-full bg-bible-600 transition-all duration-500 ease-out" 
                style={{ width: `${((currentQIndex + 1) / 10) * 100}%` }}
            ></div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-bible-100 mb-6">
            <h3 className="text-2xl font-serif font-bold text-bible-900 mb-8 leading-snug">
                {currentQ.question}
            </h3>

            <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                    let btnClass = "border-bible-200 hover:bg-bible-50 hover:border-bible-300 text-bible-800";
                    let icon = <div className="w-6 h-6 rounded-full border-2 border-bible-300 flex items-center justify-center text-xs font-bold text-bible-400 mr-3">{String.fromCharCode(65 + idx)}</div>;
                    
                    if (isAnswerRevealed) {
                        if (idx === currentQ.correctIndex) {
                            btnClass = "bg-green-50 border-green-500 text-green-900 ring-1 ring-green-500";
                            icon = <CheckCircle className="w-6 h-6 text-green-600 mr-3" />;
                        } else if (idx === selectedOption) {
                            btnClass = "bg-red-50 border-red-500 text-red-900";
                            icon = <XCircle className="w-6 h-6 text-red-600 mr-3" />;
                        } else {
                            btnClass = "opacity-50 border-bible-100";
                        }
                    } else if (selectedOption === idx) {
                        btnClass = "bg-bible-100 border-bible-500 ring-1 ring-bible-500";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            disabled={isAnswerRevealed}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center ${btnClass}`}
                        >
                            {icon}
                            <span className="font-medium">{option}</span>
                        </button>
                    )
                })}
            </div>
        </div>

        {/* Explanation / Footer */}
        <div className="h-24">
            {isAnswerRevealed && (
                <div className="animate-fade-in bg-bible-50 p-4 rounded-xl border border-bible-100 flex justify-between items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold text-sm ${selectedOption === currentQ.correctIndex ? 'text-green-700' : 'text-red-600'}`}>
                                {selectedOption === currentQ.correctIndex ? t.correct : t.wrong}
                            </span>
                            <span className="text-xs text-bible-400">•</span>
                            <span className="text-xs font-serif italic text-bible-600 flex items-center gap-1">
                                <BookOpen size={12} /> {currentQ.reference}
                            </span>
                        </div>
                        <p className="text-sm text-bible-800">{currentQ.explanation}</p>
                    </div>
                    <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-bible-800 text-white rounded-lg hover:bg-bible-900 transition-colors font-semibold shadow-md whitespace-nowrap"
                    >
                        {currentQIndex === 9 ? t.finish : t.next}
                    </button>
                </div>
            )}
        </div>

    </div>
  );
};

export default BibleQuiz;