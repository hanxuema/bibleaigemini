import React, { useState } from 'react';
import { Search, BookOpen, Share2 } from 'lucide-react';
import { UserPreferences } from '../types';
import { searchScripture } from '../services/geminiService';
import { getText } from '../constants';
import ReactMarkdown from 'react-markdown';

interface Props {
  prefs: UserPreferences;
}

const ScriptureSearch: React.FC<Props> = ({ prefs }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = getText(prefs.language).search;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const resultText = await searchScripture(query, prefs);
    setResults(resultText);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif font-bold text-bible-900">{t.title}</h2>
        <p className="text-bible-600">
          {t.subtitle(prefs.bibleVersion)}
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative shadow-lg rounded-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-bible-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-transparent bg-white text-bible-900 placeholder-bible-400 focus:outline-none focus:border-bible-300 focus:ring-0 text-lg transition-all"
          placeholder={t.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 bg-bible-600 hover:bg-bible-700 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-70"
        >
          {loading ? t.loading : t.button}
        </button>
      </form>

      {results && (
        <div className="animate-fade-in bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-bible-100">
          <div className="flex items-center gap-3 mb-6 border-b border-bible-100 pb-4">
            <BookOpen className="text-bible-600" />
            <h3 className="font-serif font-bold text-xl text-bible-800">{t.resultsTitle(prefs.bibleVersion)}</h3>
          </div>
          
          <div className="prose prose-bible prose-lg max-w-none">
            <ReactMarkdown>{results}</ReactMarkdown>
          </div>

          <div className="mt-8 pt-4 border-t border-bible-100 flex justify-end gap-3">
             <button className="text-sm text-bible-500 hover:text-bible-700 flex items-center gap-1">
                <Share2 size={16} /> {t.share}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptureSearch;