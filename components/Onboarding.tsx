import React, { useState } from 'react';
import { UserPreferences, FaithStatus } from '../types';
import { BIBLE_VERSIONS, DENOMINATIONS, LANGUAGE_OPTIONS, FAITH_STATUS_OPTIONS, getText } from '../constants';
import { ChevronRight, Check, Globe, Heart, Church } from 'lucide-react';
import { LogoIcon } from './Logo';

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
  // Get the denominations list for the current language
  const currentDenominations = getText(prefs.language).denominations || DENOMINATIONS;

  const nextStep = () => setStep(s => s + 1);
  const goToStep = (s: number) => {
    // Only allow going back or to next immediate step if current is filled (logic simplified here)
    setStep(s);
  };

  const handleComplete = () => {
    onComplete({ ...prefs, isCompleted: true });
  };

  const handleLanguageSelect = (lang: string) => {
    // When language changes, update language AND reset denomination to the first option of the new language
    // to ensure validity and consistency.
    const newTranslations = getText(lang);
    const newDenoms = newTranslations.denominations || DENOMINATIONS;
    
    setPrefs({ 
        ...prefs, 
        language: lang,
        denomination: newDenoms[0] 
    });
    nextStep();
  };

  const steps = [
    { id: 1, label: "Language", icon: Globe },
    { id: 2, label: "Faith", icon: Heart },
    { id: 3, label: "Background", icon: Church },
  ];

  const renderStepHeader = () => (
    <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-bible-100 -z-10 rounded-full"></div>
        {steps.map((s) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            const Icon = s.icon;
            return (
                <button 
                    key={s.id}
                    onClick={() => goToStep(s.id)}
                    className={`flex flex-col items-center gap-2 bg-white px-2 transition-all ${isActive || isCompleted ? 'opacity-100' : 'opacity-50'}`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive ? 'border-bible-600 bg-bible-600 text-white scale-110' : 
                        isCompleted ? 'border-bible-600 bg-white text-bible-600' : 'border-bible-200 bg-white text-bible-300'
                    }`}>
                        {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                    </div>
                    <span className={`text-xs font-semibold ${isActive ? 'text-bible-800' : 'text-bible-400'}`}>
                        {s.label}
                    </span>
                </button>
            )
        })}
    </div>
  );

  const renderStep1_Language = () => (
    <div className="space-y-4 animate-fade-in flex flex-col items-center">
      <div className="mb-2 transform scale-125">
         <LogoIcon className="w-12 h-12 shadow-md" />
      </div>
      <h2 className="text-2xl font-serif font-bold text-bible-900 text-center">{t.welcome}</h2>
      <p className="text-bible-700 text-center mb-6">{t.langStep}</p>
      <div className="grid grid-cols-2 gap-3 w-full">
        {LANGUAGE_OPTIONS.map(opt => (
          <button
            key={opt.code}
            onClick={() => handleLanguageSelect(opt.code)}
            className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
              prefs.language === opt.code 
                ? 'border-bible-500 bg-bible-100 ring-1 ring-bible-500 shadow-md' 
                : 'border-bible-200 hover:border-bible-400 hover:bg-white'
            }`}
          >
            <span className="font-medium text-bible-900">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2_Faith = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-serif font-bold text-bible-900 text-center">{t.journeyTitle}</h2>
      <p className="text-bible-700 text-center mb-6">{t.journeyDesc}</p>
      <div className="space-y-3">
        {FAITH_STATUS_OPTIONS.map(opt => {
            const translated = t.faithOptions?.[opt.value] || opt;
            return (
                <button
                    key={opt.value}
                    onClick={() => { setPrefs({ ...prefs, faithStatus: opt.value }); nextStep(); }}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group hover:shadow-md ${
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
      <h2 className="text-2xl font-serif font-bold text-bible-900 text-center">{t.bgTitle}</h2>
      <p className="text-bible-700 text-center mb-6">{t.bgDesc}</p>
      
      <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-bible-600 mb-1">Denomination</label>
            <select
                className="w-full p-3 rounded-lg border border-bible-300 bg-white text-bible-900 focus:ring-2 focus:ring-bible-500 outline-none"
                value={prefs.denomination}
                onChange={(e) => setPrefs({...prefs, denomination: e.target.value})}
            >
                {currentDenominations.map((d: string) => (
                <option key={d} value={d}>{d}</option>
                ))}
            </select>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-bible-600 mb-1">{t.versionLabel}</label>
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
      </div>

      <button
        onClick={handleComplete}
        className="w-full mt-8 bg-bible-600 text-white py-3.5 rounded-xl font-semibold hover:bg-bible-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        {t.startBtn} <Check size={18} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bible-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-8 border border-bible-100">
        
        {renderStepHeader()}
        
        <div className="min-h-[320px]">
            {step === 1 && renderStep1_Language()}
            {step === 2 && renderStep2_Faith()}
            {step === 3 && renderStep3_Denomination()}
        </div>

      </div>
    </div>
  );
};

export default Onboarding;