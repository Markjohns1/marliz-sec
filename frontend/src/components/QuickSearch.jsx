import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getArticles } from '../services/api';

export default function QuickSearch({
    placeholder = "Quick search...",
    className = "",
    onSearch,
    initialValue = "",
    liveResults = false
}) {
    const [query, setQuery] = useState(initialValue);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        setQuery(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (liveResults && query.trim().length >= 2) {
                setLoading(true);
                try {
                    const data = await getArticles({ search: query, limit: 5 });
                    setResults(data.articles || []);
                    setShowResults(true);
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                if (query.trim().length === 0) setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, liveResults]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            if (onSearch) {
                onSearch(query);
            } else {
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                setShowResults(false);
            }
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <form onSubmit={handleSubmit} className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (onSearch && !liveResults) onSearch(e.target.value);
                    }}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/50 border border-slate-700/50 focus:border-blue-500 focus:bg-slate-950 outline-none text-sm transition-all text-white placeholder-slate-500"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />
                )}
                {!loading && query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(''); setResults([]); setShowResults(false); if (onSearch) onSearch(''); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
                    </button>
                )}
            </form>

            {/* Live Results Dropdown */}
            {liveResults && showResults && (results.length > 0 || loading) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 px-2 uppercase tracking-widest">Intelligence Matches</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {results.map((article) => (
                            <button
                                key={article.id}
                                onClick={() => {
                                    navigate(`/article/${article.slug}`);
                                    setShowResults(false);
                                    setQuery('');
                                }}
                                className="w-full text-left p-3 hover:bg-white/5 border-b border-slate-800/50 last:border-0 transition-colors group"
                            >
                                <div className="text-[10px] font-black text-blue-400 uppercase tracking-tighter mb-1">{article.category?.name || 'General'}</div>
                                <div className="text-sm font-bold text-slate-200 group-hover:text-white line-clamp-1">{article.title}</div>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="w-full p-3 text-center text-xs font-black text-slate-400 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-widest border-t border-slate-800"
                    >
                        See all results for "{query}"
                    </button>
                </div>
            )}
        </div>
    );
}
