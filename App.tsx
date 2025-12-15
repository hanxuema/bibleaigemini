import React, { useState, useEffect } from 'react';
import { UserPreferences, AppView, ChatMessage } from './types';
import Onboarding from './components/Onboarding';
import ChatInterface from './components/ChatInterface';
import ScriptureSearch from './components/ScriptureSearch';
import DailyVerseTicker from './components/DailyVerseTicker';
import BibleQuiz from './components/BibleQuiz';
import { askPastor, generatePrayer } from './services/geminiService';
import { checkRateLimit, incrementUsage } from './services/rateLimit';
import { Book, MessageCircle, Heart, Settings, Menu, X, Crown, Search as SearchIcon, Clock, BrainCircuit } from 'lucide-react';
import { getText } from './constants';

const App: React.FC = () => {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.ONBOARDING);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Chat States
  const [pastorMessages, setPastorMessages] = useState<ChatMessage[]>([]);
  const [prayerMessages, setPrayerMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Deep linking simulation (basic hash routing)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#search') setCurrentView(AppView.SEARCH);
    else if (hash === '#pastor') setCurrentView(AppView.PASTOR);
    else if (hash === '#prayer') setCurrentView(AppView.PRAYER);
    else if (hash === '#quiz') setCurrentView(AppView.QUIZ);
  }, []);

  const handleOnboardingComplete = (newPrefs: UserPreferences) => {
    setPrefs(newPrefs);
    setCurrentView(AppView.SEARCH); // Default to search after onboarding
  };

  const checkLimitAndNotify = (currentMessages: ChatMessage[], setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>) => {
      if (!checkRateLimit()) {
          const limitMsg: ChatMessage = {
              id: Date.now().toString(),
              role: 'model',
              text: prefs ? getText(prefs.language).common.rateLimit : "Rate limit reached.",
              timestamp: Date.now(),
              isThinking: false
          };
          setMessages([...currentMessages, limitMsg]);
          return false;
      }
      return true;
  };

  const handlePastorMessage = async (text: string) => {
    if (!prefs) return;
    
    // Optimistic user message update
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };
    const nextMessages = [...pastorMessages, userMsg];
    setPastorMessages(nextMessages);

    // Rate Limit Check
    if (!checkLimitAndNotify(nextMessages, setPastorMessages)) return;

    setIsLoading(true);
    incrementUsage();

    const response = await askPastor(text, pastorMessages.map(m => m.text), prefs);
    
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.markdown,
      timestamp: Date.now(),
      followUps: response.followUps,
      references: response.references
    };
    
    setPastorMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handlePrayerRequest = async (text: string) => {
    if (!prefs) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: `Please pray for: ${text}`,
      timestamp: Date.now()
    };
    const nextMessages = [...prayerMessages, userMsg];
    setPrayerMessages(nextMessages);

    // Rate Limit Check
    if (!checkLimitAndNotify(nextMessages, setPrayerMessages)) return;

    setIsLoading(true);
    incrementUsage();

    const response = await generatePrayer(text, prefs);
    
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.markdown,
      timestamp: Date.now(),
      followUps: response.followUps,
      references: response.references
    };
    
    setPrayerMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const NavItem = ({ view, icon: Icon, label, lock = false }: { view: AppView, icon: any, label: string, lock?: boolean }) => (
    <button
      onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
        currentView === view 
          ? 'bg-bible-600 text-white shadow-md' 
          : 'text-bible-800 hover:bg-bible-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium flex-1 text-left">{label}</span>
      {lock && <Crown size={16} className="text-yellow-600" />}
    </button>
  );

  if (!prefs || !prefs.isCompleted) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Get translations based on user preference
  const t = getText(prefs.language);

  return (
    <div className="min-h-screen bg-bible-50 text-bible-900 font-sans flex overflow-hidden">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:relative z-30 w-64 h-full bg-white border-r border-bible-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="p-6 border-b border-bible-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-bible-800">
             <Book className="text-bible-600" />
             <span className="font-serif font-bold text-xl tracking-tight">BibleAI</span>
          </div>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-bible-400 uppercase tracking-wider mb-2 px-3">{t.nav.menu}</div>
          <NavItem view={AppView.SEARCH} icon={SearchIcon} label={t.nav.search} />
          <NavItem view={AppView.QUIZ} icon={BrainCircuit} label={t.nav.quiz} />
          <NavItem view={AppView.PASTOR} icon={MessageCircle} label={t.nav.pastor} lock={true} />
          <NavItem view={AppView.PRAYER} icon={Heart} label={t.nav.prayer} lock={true} />
          
          <div className="mt-8 text-xs font-semibold text-bible-400 uppercase tracking-wider mb-2 px-3">{t.nav.account}</div>
          <NavItem view={AppView.SUBSCRIPTION} icon={Crown} label={t.nav.sub} />
          <NavItem view={AppView.SETTINGS} icon={Settings} label={t.nav.settings} />
        </nav>

        <div className="p-4 border-t border-bible-100 bg-bible-50/50">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-bible-200 flex items-center justify-center text-bible-600 font-bold">
                    {prefs.language.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{prefs.denomination}</p>
                    <p className="text-xs text-bible-500">{prefs.bibleVersion}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-bible-200 flex items-center px-4 justify-between shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="text-bible-700">
                <Menu />
            </button>
            <span className="font-serif font-bold text-lg text-bible-800">BibleAI</span>
            <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Daily Verse Ticker */}
        <DailyVerseTicker language={prefs.language} />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-[1400px] mx-auto w-full h-full relative">
            {currentView === AppView.SEARCH && (
                <ScriptureSearch prefs={prefs} />
            )}

            {currentView === AppView.QUIZ && (
                <BibleQuiz prefs={prefs} />
            )}

            {currentView === AppView.PASTOR && (
                <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8 space-y-6 animate-fade-in">
                    <div className="w-20 h-20 bg-bible-200 rounded-full flex items-center justify-center text-bible-600 mb-4">
                        <MessageCircle size={40} />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold mb-3">
                            <Clock size={12} /> {t.common.comingSoon}
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-bible-900 mb-2">{t.common.advancedQaTitle}</h2>
                        <p className="text-bible-600 max-w-md mx-auto">{t.common.advancedQaDesc}</p>
                    </div>
                    <button 
                        onClick={() => setCurrentView(AppView.SUBSCRIPTION)}
                        className="px-6 py-3 bg-bible-800 text-white rounded-xl hover:bg-bible-900 transition-colors font-semibold shadow-lg"
                    >
                        {t.sub.trial}
                    </button>
                </div>
            )}

            {currentView === AppView.PRAYER && (
                <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
                    <ChatInterface 
                        messages={prayerMessages} 
                        onSendMessage={handlePrayerRequest} 
                        isLoading={isLoading}
                        placeholder={t.chat.placeholder}
                        personaName="Prayer Companion"
                        emptyStateText={t.chat.emptyPrayer}
                        prefs={prefs}
                    />
                </div>
            )}

            {currentView === AppView.SUBSCRIPTION && (
                <div className="max-w-2xl mx-auto text-center py-12 space-y-8 animate-fade-in">
                    <div className="inline-block p-4 bg-yellow-100 rounded-full text-yellow-600 mb-4">
                        <Crown size={48} />
                    </div>
                    <h2 className="text-4xl font-serif font-bold text-bible-900">{t.sub.title}</h2>
                    <p className="text-lg text-bible-600">{t.sub.desc}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6 text-left mt-8">
                        {/* Free Plan */}
                        <div className="bg-white p-6 rounded-2xl border border-bible-200 shadow-sm">
                            <h3 className="font-bold text-xl mb-2">{t.sub.free}</h3>
                            <ul className="space-y-3 text-bible-600 mb-8 mt-4">
                                <li className="flex gap-3"><Settings size={18} className="text-bible-400"/> {t.nav.search}</li>
                                <li className="flex gap-3"><Settings size={18} className="text-bible-400"/> {t.common.dailyVerse}</li>
                            </ul>
                            <button disabled className="w-full py-2.5 border border-bible-300 rounded-lg text-bible-500 font-medium bg-bible-50">{t.sub.current}</button>
                        </div>

                        {/* Pro Plan (Coming Soon) */}
                        <div className="bg-gradient-to-br from-bible-800 to-bible-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold shadow-sm">{t.sub.rec}</div>
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 text-yellow-400">
                                    <Clock size={20} />
                                    <span className="font-bold tracking-wider text-sm">{t.common.comingSoon}</span>
                                </div>
                                <h3 className="font-bold text-xl mb-4 text-white">{t.sub.pro}</h3>
                                
                                <ul className="space-y-3 text-bible-200 mb-6">
                                    <li className="flex gap-3"><Crown size={18} className="text-yellow-500"/> {t.sub.feature1}</li>
                                    <li className="flex gap-3"><Crown size={18} className="text-yellow-500"/> {t.sub.feature2}</li>
                                    <li className="flex gap-3"><Crown size={18} className="text-yellow-500"/> {t.sub.feature3}</li>
                                </ul>
                            </div>
                            
                            <button className="w-full py-2.5 bg-yellow-500 text-bible-900 rounded-lg hover:bg-yellow-400 transition-colors font-bold shadow-lg">
                                {t.sub.trial}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {currentView === AppView.SETTINGS && (
                <div className="max-w-md mx-auto space-y-6">
                    <h2 className="text-2xl font-serif font-bold text-bible-900">{t.settings.title}</h2>
                    <div className="bg-white p-6 rounded-xl border border-bible-200 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-bible-700 mb-1">{t.settings.denom}</label>
                            <div className="p-3 bg-bible-50 rounded-lg text-bible-900 border border-bible-100">{prefs.denomination}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-bible-700 mb-1">{t.settings.version}</label>
                            <div className="p-3 bg-bible-50 rounded-lg text-bible-900 border border-bible-100">{prefs.bibleVersion}</div>
                        </div>
                        <button 
                            onClick={() => setPrefs({...prefs, isCompleted: false})}
                            className="text-bible-600 text-sm hover:underline mt-2"
                        >
                            {t.settings.reset}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default App;