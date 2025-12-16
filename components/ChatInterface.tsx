import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2, BookOpen, ChevronRight, X, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, UserPreferences, BibleReference } from '../types';
import { getText } from '../constants';
import { getChapterContentStream } from '../services/geminiService';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
  personaName: string;
  emptyStateText?: string;
  prefs: UserPreferences;
}

const ChatInterface: React.FC<Props> = ({ messages, onSendMessage, isLoading, placeholder, personaName, emptyStateText, prefs }) => {
  const [input, setInput] = useState('');
  const [activeRefs, setActiveRefs] = useState<BibleReference[]>([]);
  const [showRefPanel, setShowRefPanel] = useState(false);
  
  // Chapter Reader State
  const [readingChapter, setReadingChapter] = useState<{title: string, content: string} | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = getText(prefs.language).chat;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Update active references state based on latest, but DO NOT auto-open
  useEffect(() => {
    const lastAiMsg = [...messages].reverse().find(m => m.role === 'model');
    if (lastAiMsg?.references && lastAiMsg.references.length > 0) {
      setActiveRefs(lastAiMsg.references);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleFollowUpClick = (text: string) => {
    if (!isLoading) {
      onSendMessage(text);
    }
  };

  const handleShowReferences = (refs: BibleReference[]) => {
      setActiveRefs(refs);
      setShowRefPanel(true);
  };

  const handleReadChapter = async (ref: BibleReference) => {
    const chapterRef = ref.chapter || ref.ref.split(':')[0]; // e.g., "John 3"
    
    setReadingChapter({ title: chapterRef, content: '' }); // Open modal immediately
    setIsLoadingChapter(true);

    try {
        const stream = getChapterContentStream(chapterRef, prefs);
        
        let fullContent = '';
        let hasStarted = false;

        for await (const chunk of stream) {
            if (!hasStarted) {
                setIsLoadingChapter(false);
                hasStarted = true;
            }
            fullContent += chunk;
            setReadingChapter(prev => ({ 
                title: prev?.title || chapterRef, 
                content: fullContent 
            }));
        }
    } catch (e) {
        console.error(e);
        setIsLoadingChapter(false);
        setReadingChapter(prev => ({ 
            title: prev?.title || chapterRef, 
            content: prev?.content || "Error loading chapter text."
        }));
    }
  };

  return (
    <div className="flex h-full bg-white rounded-xl shadow-sm border border-bible-100 overflow-hidden relative">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-bible-50 p-4 border-b border-bible-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-bible-200 rounded-full text-bible-700">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="font-serif font-bold text-bible-900 leading-tight">{personaName}</h3>
                    <p className="text-[10px] text-bible-500 uppercase tracking-wider">AI Powered • Strictly Biblical</p>
                </div>
            </div>
            
            {/* Context Toggle (shows latest refs if panel is closed) */}
            {activeRefs.length > 0 && !showRefPanel && (
                <button 
                    onClick={() => setShowRefPanel(true)}
                    className="text-bible-600 hover:bg-bible-100 p-2 rounded-lg"
                    title={t.viewReferences}
                >
                    <BookOpen size={20} />
                </button>
            )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-bible-400 opacity-60">
                    <Sparkles size={48} className="mb-4" />
                    <p>{emptyStateText || t.emptyPastor}</p>
                </div>
            )}
            
            {messages.map((msg) => (
            <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
                <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative ${
                    msg.role === 'user'
                    ? 'bg-bible-600 text-white rounded-br-none'
                    : 'bg-white border border-bible-100 text-bible-900 rounded-bl-none'
                }`}
                >
                    <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-medium">
                        {msg.role === 'user' ? (
                        <>{t.you} <User size={12} /></>
                        ) : (
                        <><Sparkles size={12} /> {personaName}</>
                        )}
                    </div>
                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-stone'}`}>
                        <ReactMarkdown 
                            components={{
                                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-bible-600 underline hover:text-bible-800" />
                            }}
                        >
                            {msg.text}
                        </ReactMarkdown>
                    </div>

                    {/* View References Button (Inside bubble, but distinct) */}
                    {msg.role === 'model' && msg.references && msg.references.length > 0 && (
                        <button 
                            onClick={() => handleShowReferences(msg.references!)}
                            className="mt-3 flex items-center gap-2 text-xs font-semibold text-bible-600 bg-bible-50 px-3 py-2 rounded-lg hover:bg-bible-100 transition-colors w-full border border-bible-100"
                        >
                            <BookOpen size={14} />
                            {t.viewReferences}
                        </button>
                    )}
                </div>

                {/* Follow Up Chips */}
                {msg.role === 'model' && msg.followUps && msg.followUps.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 max-w-[85%] animate-fade-in">
                        {msg.followUps.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleFollowUpClick(q)}
                                disabled={isLoading}
                                className="text-xs bg-bible-50 text-bible-700 border border-bible-200 px-3 py-1.5 rounded-full hover:bg-bible-100 hover:border-bible-300 transition-colors flex items-center gap-1"
                            >
                                {q} <ChevronRight size={10} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            ))}

            {isLoading && (
            <div className="flex justify-start w-full animate-pulse">
                <div className="bg-white border border-bible-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-3">
                    <Loader2 size={18} className="animate-spin text-bible-500" />
                    <span className="text-bible-500 text-sm font-medium">{t.consulting}</span>
                </div>
            </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-bible-100">
            <form onSubmit={handleSubmit} className="relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder || t.placeholder}
                disabled={isLoading}
                className="w-full p-4 pr-12 rounded-xl bg-bible-50 border border-bible-200 focus:outline-none focus:ring-2 focus:ring-bible-400 text-bible-900 placeholder-bible-400 shadow-inner"
            />
            <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-bible-600 text-white rounded-lg disabled:opacity-50 hover:bg-bible-700 transition-colors shadow-sm"
            >
                <Send size={18} />
            </button>
            </form>
            <div className="text-center mt-2">
                <p className="text-[10px] text-bible-400">{t.aiFooter}</p>
            </div>
        </div>
      </div>

      {/* Scripture Reference Side Panel */}
      {showRefPanel && (
        <div className="w-80 border-l border-bible-100 bg-bible-50 flex flex-col shadow-xl absolute md:relative right-0 h-full z-10 md:z-0 transform transition-transform duration-300">
            <div className="p-4 border-b border-bible-100 flex items-center justify-between bg-white">
                <h4 className="font-serif font-bold text-bible-800 flex items-center gap-2">
                    <BookOpen size={16} /> Cited Scripture
                </h4>
                <button 
                    onClick={() => setShowRefPanel(false)}
                    className="text-bible-400 hover:text-bible-600"
                >
                    <X size={18} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeRefs.length === 0 ? (
                    <div className="text-center text-bible-400 mt-10 text-sm">
                        No scripture references cited.
                    </div>
                ) : (
                    activeRefs.map((ref, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg border border-bible-200 shadow-sm hover:border-bible-300 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-bible-800 text-sm border-b-2 border-bible-100 pb-0.5">{ref.ref}</span>
                                <span className="text-[10px] text-bible-400 bg-bible-50 px-1.5 py-0.5 rounded">{prefs.bibleVersion}</span>
                            </div>
                            <p className="text-bible-700 text-sm italic font-serif leading-relaxed">
                                "{ref.text}"
                            </p>
                            <div className="mt-2 flex justify-end">
                                <button 
                                    onClick={() => handleReadChapter(ref)}
                                    className="text-[10px] text-bible-500 font-medium hover:text-bible-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Read Full Chapter <Maximize2 size={10} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}

      {/* Full Chapter Modal / Popup */}
      {readingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col relative animate-scale-in">
                {/* Modal Header */}
                <div className="p-5 border-b border-bible-100 flex items-center justify-between bg-bible-50 rounded-t-2xl">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-bible-900">{readingChapter.title}</h3>
                        <span className="text-xs font-semibold text-bible-500 uppercase tracking-widest">{prefs.bibleVersion}</span>
                    </div>
                    <button 
                        onClick={() => setReadingChapter(null)}
                        className="p-2 hover:bg-bible-200 rounded-full text-bible-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white rounded-b-2xl">
                    {isLoadingChapter && !readingChapter.content ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="animate-spin text-bible-500" size={32} />
                            <p className="text-bible-400 font-medium animate-pulse">Retrieving sacred text...</p>
                        </div>
                    ) : (
                        <div className="prose prose-lg prose-stone max-w-none font-serif leading-loose text-bible-900">
                             <ReactMarkdown>{readingChapter.content}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ChatInterface;