import React, { useState } from 'react';
import { UserPreferences, ChatMessage } from '../types';
import { searchScripture } from '../services/geminiService';
import { checkRateLimit, incrementUsage } from '../services/rateLimit';
import { getText } from '../constants';
import ChatInterface from './ChatInterface';

interface Props {
  prefs: UserPreferences;
}

const ScriptureSearch: React.FC<Props> = ({ prefs }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const t = getText(prefs.language).search;
  const commonT = getText(prefs.language).common;

  const handleSearch = async (text: string) => {
    
    // Create user message
    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: text,
        timestamp: Date.now()
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);

    // Rate Limit Check
    if (!checkRateLimit()) {
        const limitMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: commonT.rateLimit,
            timestamp: Date.now() + 1
        };
        setMessages(prev => [...prev, limitMsg]);
        return;
    }

    setLoading(true);
    incrementUsage();

    // Call API
    const response = await searchScripture(text, prefs);

    // Create AI response message
    const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.markdown,
        timestamp: Date.now(),
        followUps: response.followUps,
        references: response.references
    };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
        <ChatInterface 
            messages={messages} 
            onSendMessage={handleSearch} 
            isLoading={loading}
            placeholder={t.placeholder}
            personaName={t.title}
            emptyStateText={t.subtitle(prefs.bibleVersion)}
            prefs={prefs}
        />
    </div>
  );
};

export default ScriptureSearch;