import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, UserPreferences } from '../types';
import { getText } from '../constants';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = getText(prefs.language).chat;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-bible-100 overflow-hidden">
        {/* Header */}
        <div className="bg-bible-50 p-4 border-b border-bible-100 flex items-center gap-3">
            <div className="p-2 bg-bible-200 rounded-full text-bible-700">
                <Sparkles size={20} />
            </div>
            <div>
                <h3 className="font-serif font-bold text-bible-900">{personaName}</h3>
                <p className="text-xs text-bible-500 uppercase tracking-wider">AI Powered • Strictly Biblical</p>
            </div>
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
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
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
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
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
            className="w-full p-4 pr-12 rounded-xl bg-bible-50 border border-bible-200 focus:outline-none focus:ring-2 focus:ring-bible-400 text-bible-900 placeholder-bible-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-bible-600 text-white rounded-lg disabled:opacity-50 hover:bg-bible-700 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="text-center mt-2">
            <p className="text-[10px] text-bible-400">{t.aiFooter}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;