import React from 'react';
import { DAILY_VERSES, getText } from '../constants';
import { BrainCircuit } from 'lucide-react';

interface Props {
    language: string;
    onQuizClick: () => void;
}

const DailyVerseTicker: React.FC<Props> = ({ language, onQuizClick }) => {
    const t = getText(language).common;
    
    // Select a verse based on the day of the year to be consistent for 24h
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const verseIndex = dayOfYear % DAILY_VERSES.length;
    const verseData = DAILY_VERSES[verseIndex];
    
    const isChinese = language.includes('Chinese');
    const verse = isChinese ? verseData.zh : verseData.en;

    return (
        <div className="bg-bible-800 text-bible-100 h-10 overflow-hidden relative shadow-md z-10 flex">
            {/* Left Label */}
            <div className="absolute left-0 top-0 bottom-0 bg-bible-900 px-3 flex items-center z-20 shadow-lg text-xs font-bold uppercase tracking-wider">
                {t.dailyVerse}
            </div>

            {/* Scrolling Text */}
            <div className="flex-1 overflow-hidden relative flex items-center">
                 <div className="whitespace-nowrap animate-marquee flex items-center">
                    <span className="inline-block pl-28 pr-10 font-serif italic text-sm">
                        "{verse.text}" — <span className="font-sans not-italic font-bold opacity-80">{verse.ref}</span>
                    </span>
                    <span className="inline-block px-10 font-serif italic text-sm md:hidden">
                        "{verse.text}" — <span className="font-sans not-italic font-bold opacity-80">{verse.ref}</span>
                    </span>
                </div>
            </div>

            {/* Right Action Button */}
            <button 
                onClick={onQuizClick}
                className="absolute right-0 top-0 bottom-0 z-30 bg-yellow-500 hover:bg-yellow-400 text-bible-900 px-4 flex items-center gap-2 font-bold text-xs transition-colors shadow-lg"
            >
                <BrainCircuit size={14} />
                <span className="hidden sm:inline">{t.quizBtn}</span>
                <span className="sm:hidden">Quiz</span>
            </button>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(20%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 25s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default DailyVerseTicker;