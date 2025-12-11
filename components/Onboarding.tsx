import React, { useState } from 'react';
import { UserPreferences, FaithStatus } from '../types';
import { BIBLE_VERSIONS, DENOMINATIONS, LANGUAGES, FAITH_STATUS_OPTIONS, getText } from '../constants';
import { Book, ChevronRight, Check } from 'lucide-react';

interface Props {
  onComplete: (prefs: UserPreferences) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    name: '',
    isCompleted: false,
    faithStatus: FaithStatus.SEEKER,
    denomination: DENOMINATIONS[0],
    bibleVersion: 'NIV',
    language: 'English',
    isPro: false,
  });

  const t = getText(prefs.language).onboarding;

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleComplete = () => {
    onComplete({ ...prefs, isCompleted: true });
  };

  const renderStep1_Language = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-serif font-bold text-bible-900">{t.welcome}</h2>
      <p className="text-bible-700">{t.langStep}</p>
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => { setPrefs({ ...prefs, language: lang }); nextStep(); }}
            className={`p-4 rounded-xl border text-left transition-all ${
              prefs.language === lang 
                ? 'border-bible-500 bg-bible-100 ring-1 ring-bible-500' 
                : 'border-bible-200 hover:border-bible-400 hover:bg-white'
            }`}
          >
            <span className="font-medium text-bible-900">{lang}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2_Faith = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-serif font-bold text-bible-900">{t.journeyTitle}</h2>
      <p className="text-bible-700">{t.journeyDesc}</p>
      <div className="space-y-3">
        {FAITH_STATUS_OPTIONS.map(opt => {
            // Get translated label/desc if available
            const translated = t.faithOptions?.[opt.value] || opt;
            
            return (
                <button
                    key={opt.value}
                    onClick={() => { setPrefs({ ...prefs, faithStatus: opt.value }); nextStep(); }}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    prefs.faithStatus === opt.value
                        ? 'border-bible-500 bg-bible-100'
                        : 'border-bible-200 hover:border-bible-400 bg-white'
                    }`}
                >
                    <div>
                    <div className="font-semibold text-bible-900">{translated.label}</div>
                    <div className="text-sm text-bible-600">{translated.desc}</div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-bible-400 ${prefs.faithStatus === opt.value ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
            )
        })}
      </div>
    </div>
  );

  const renderStep3_Denomination = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-serif font-bold text-bible-900">{t.bgTitle}</h2>
      <p className="text-bible-700">{t.bgDesc}</p>
      <select
        className="w-full p-3 rounded-lg border border-bible-300 bg-white text-bible-900 focus:ring-2 focus:ring-bible-500 outline-none"
        value={prefs.denomination}
        onChange={(e) => setPrefs({...prefs, denomination: e.target.value})}
      >
        {DENOMINATIONS.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      
      <div className="pt-4">
        <p className="text-bible-700 mb-2">{t.versionLabel}</p>
        <select
            className="w-full p-3 rounded-lg border border-bible-300 bg-white text-bible-900 focus:ring-2 focus:ring-bible-500 outline-none"
            value={prefs.bibleVersion}
            onChange={(e) => setPrefs({...prefs, bibleVersion: e.target.value})}
        >
            {BIBLE_VERSIONS.map(v => (
            <option key={v.code} value={v.code}>{v.name}</option>
            ))}
        </select>
      </div>

      <button
        onClick={handleComplete}
        className="w-full mt-6 bg-bible-600 text-white py-3 rounded-lg font-semibold hover:bg-bible-700 transition-colors shadow-md flex items-center justify-center gap-2"
      >
        {t.startBtn} <Check size={18} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bible-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border border-bible-100">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-bible-100 rounded-full flex items-center justify-center text-bible-600">
            <Book size={24} />
          </div>
        </div>
        
        {step === 1 && renderStep1_Language()}
        {step === 2 && renderStep2_Faith()}
        {step === 3 && renderStep3_Denomination()}

        <div className="mt-8 flex justify-center gap-2">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-bible-600' : 'w-2 bg-bible-200'}`} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;