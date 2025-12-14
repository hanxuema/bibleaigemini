import React from 'react';
import { DAILY_VERSES, getText } from '../constants';

interface Props {
    language: string;
}

const DailyVerseTicker: React.FC<Props> = ({ language }) => {
    const t = getText(language).common;
    
    // Select a verse based on the day of the year to be consistent for 24h
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const verseIndex = dayOfYear % DAILY_VERSES.length;
    const verseData = DAILY_VERSES[verseIndex];
    
    const isChinese = language.includes('Chinese');
    const verse = isChinese ? verseData.zh : verseData.en;

    return (
        <div className="bg-bible-800 text-bible-100 py-2 overflow-hidden relative shadow-md z-10">
            <div className="absolute left-0 top-0 bottom-0 bg-bible-900 px-3 flex items-center z-20 shadow-lg text-xs font-bold uppercase tracking-wider">
                {t.dailyVerse}
            </div>
            <div className="whitespace-nowrap animate-marquee flex items-center">
                {/* Duplicated content for seamless loop illusion if needed, but simple scroll is fine */}
                <span className="inline-block pl-28 pr-10 font-serif italic text-sm">
                    "{verse.text}" — <span className="font-sans not-italic font-bold opacity-80">{verse.ref}</span>
                </span>
                <span className="inline-block px-10 font-serif italic text-sm md:hidden">
                    "{verse.text}" — <span className="font-sans not-italic font-bold opacity-80">{verse.ref}</span>
                </span>
            </div>
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