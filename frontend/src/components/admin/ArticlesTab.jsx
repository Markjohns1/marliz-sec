import QuickSearch from '../QuickSearch';
import { useState } from 'react';
import { triggerNewsletterDigest } from '../../services/api';
import {
    Clock, FileText, BarChart3, Share2,
    Edit3, ExternalLink, Send, CheckSquare, Square, X,
    ArrowDownRight, ArrowUpRight
} from 'lucide-react';

export default function ArticlesTab({
    artSearch, setArtSearch, setArtPage, artSort, setArtSort,
    artOrder, setArtOrder,
    artLoading, articleData, artPage,
    setViewingStats, setSharingArticle, setEditingArticle,
    targetAudience = [], clearTargetAudience
}) {
    const [selectedArticles, setSelectedArticles] = useState([]);
    const [customNote, setCustomNote] = useState('');
    const [isDeploying, setIsDeploying] = useState(false);

    const toggleSelection = (id) => {
        if (selectedArticles.includes(id)) {
            setSelectedArticles(prev => prev.filter(a => a !== id));
        } else {
            if (selectedArticles.length >= 2) {
                alert("The intelligence digest is optimized for a maximum of 2 key articles for maximum impact.");
                return;
            }
            setSelectedArticles(prev => [...prev, id]);
        }
    };

    const handleManualDeploy = async () => {
        if (selectedArticles.length === 0) return;

        const confirmMsg = targetAudience.length > 0
            ? `Send this custom intelligence to ${targetAudience.length} target recipients ONLY?`
            : "Broadcast this intelligence to ALL active subscribers?";

        if (!confirm(confirmMsg)) return;

        setIsDeploying(true);
        try {
            const res = await triggerNewsletterDigest(selectedArticles, customNote, targetAudience);
            alert(res.message);
            setSelectedArticles([]);
            setCustomNote('');
            if (clearTargetAudience) clearTargetAudience();
        } catch (err) {
            console.error(err);
            alert("Failed to deploy digest.");
        } finally {
            setTimeout(() => setIsDeploying(false), 1000);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {targetAudience.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Send className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Targeted Dispatch Mode</div>
                            <div className="text-white font-bold text-sm">Sending to {targetAudience.length} selected recipients</div>
                        </div>
                    </div>
                    <button
                        onClick={clearTargetAudience}
                        className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all"
                    >
                        Switch to Full Blast
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-black text-white tracking-tight">Article Management</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <QuickSearch
                        placeholder="Quick search..."
                        className="flex-1 sm:w-64"
                        initialValue={artSearch}
                        onSearch={(val) => { setArtSearch(val); setArtPage(1); }}
                    />
                    <select
                        value={artSort}
                        onChange={(e) => { setArtSort(e.target.value); setArtPage(1); }}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer hover:bg-slate-800"
                    >
                        <option value="date">Most Recent</option>
                        <option value="views">High Traffic</option>
                        <option value="words">Word Count</option>
                        <option value="impressions">SEO Impressions</option>
                        <option value="position">GSC Visibility</option>
                    </select>
                    <button
                        onClick={() => { setArtOrder(prev => prev === 'desc' ? 'asc' : 'desc'); setArtPage(1); }}
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center min-w-[45px]"
                        title={artOrder === 'desc' ? "Descending" : "Ascending"}
                    >
                        {artOrder === 'desc' ? (
                            <ArrowDownRight className="w-5 h-5 text-blue-400" />
                        ) : (
                            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                        )}
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden bg-slate-900/50 border border-slate-800 rounded-2xl">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/80 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5">Intelligence Report</div>
                    <div className="col-span-3 text-center">Metrics</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-slate-800/50">
                    {artLoading ? (
                        <div className="px-6 py-12 flex flex-col items-center justify-center gap-4">
                            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="text-slate-500 font-bold italic text-sm">Scanning Intelligence Database...</div>
                        </div>
                    ) : (!articleData || !articleData.articles || articleData.articles.length === 0) ? (
                        <div className="px-6 py-12 text-center text-slate-500 font-bold italic">No intelligence reports found.</div>
                    ) : articleData.articles.map((article) => (
                        <div
                            key={article.id}
                            className={`flex flex-col md:grid md:grid-cols-12 gap-4 px-5 py-5 md:px-6 md:py-4 hover:bg-white/5 transition-all group ${selectedArticles.includes(article.id) ? 'bg-blue-500/5' : ''}`}
                        >
                            {/* TOP ROW: Selection & Status (Mobile Optimized) */}
                            <div className="col-span-1 flex items-center justify-between md:justify-center mb-1 md:mb-0">
                                <button
                                    onClick={() => toggleSelection(article.id)}
                                    className={`flex items-center gap-2 p-2 -ml-2 rounded-xl transition-all ${selectedArticles.includes(article.id) ? 'text-blue-400 bg-blue-400/10' : 'text-slate-600 hover:text-slate-400'}`}
                                >
                                    {selectedArticles.includes(article.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    <span className="md:hidden text-[10px] font-black uppercase tracking-widest">Target for Digest</span>
                                </button>

                                <div className="md:hidden">
                                    {article.has_draft ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                            Draft
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                            Live
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* MAIN INFO: Title & Meta */}
                            <div className="col-span-5 flex flex-col justify-center">
                                <span className="text-sm md:text-[13px] font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                                    {article.title}
                                </span>
                                <div className="flex items-center gap-3 mt-2.5">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-950 text-[9px] font-black text-slate-500 border border-slate-800 uppercase tracking-widest">
                                        {article.category?.name || 'General'}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                                        <Clock className="w-3 h-3 text-slate-600" />
                                        {article.published_at ? new Date(article.published_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {/* METRICS GRID: Space-saving layout for mobile */}
                            <div className="col-span-3 grid grid-cols-3 md:flex md:items-center md:justify-center gap-4 md:gap-6 py-4 px-4 md:py-0 md:px-0 bg-slate-950/40 md:bg-transparent rounded-2xl my-2 md:my-0 border border-slate-800/50 md:border-0">
                                <div className="text-center">
                                    <div className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-tighter mb-0.5">Views</div>
                                    <div className="text-xs font-black text-blue-400">{(article.views || 0).toLocaleString()}</div>
                                </div>
                                <div className="text-center border-x border-slate-800/50 md:border-0 px-2">
                                    <div className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-tighter mb-0.5">Words</div>
                                    <div className={`text-xs font-black ${(
                                        (article.simplified?.friendly_summary?.length || 0) +
                                        (article.simplified?.attack_vector?.length || 0) +
                                        (article.simplified?.business_impact?.length || 0)
                                    ) >= 4800 ? 'text-emerald-400' : 'text-rose-400 opacity-80'}`}>
                                        {Math.round((
                                            (article.simplified?.friendly_summary?.length || 0) +
                                            (article.simplified?.attack_vector?.length || 0) +
                                            (article.simplified?.business_impact?.length || 0)
                                        ) / 6)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-tighter mb-0.5">Rank</div>
                                    <div className={`text-xs font-black ${article.position < 10 && article.position > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {article.position > 0 ? article.position.toFixed(1) : '-'}
                                    </div>
                                </div>
                            </div>

                            {/* STATUS: Desktop only (Mobile shows in top row) */}
                            <div className="hidden md:flex col-span-1 items-center justify-center">
                                {article.has_draft ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                        Draft
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                        Live
                                    </span>
                                )}
                            </div>

                            {/* ACTIONS: Premium toolbar */}
                            <div className="col-span-2 flex items-center justify-between md:justify-end gap-1 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-slate-800/30">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setViewingStats(article)}
                                        className="p-2.5 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all border border-slate-800 md:border-transparent"
                                        title="Analytics"
                                    >
                                        <BarChart3 className="w-5 h-5 md:w-4 md:h-4" />
                                    </button>
                                    <button
                                        onClick={() => setSharingArticle(article)}
                                        className="p-2.5 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all border border-slate-800 md:border-transparent"
                                        title="Share"
                                    >
                                        <Share2 className="w-5 h-5 md:w-4 md:h-4" />
                                    </button>
                                    <button
                                        onClick={() => setEditingArticle(article)}
                                        className="p-2.5 text-orange-400 hover:bg-orange-500/10 rounded-xl transition-all border border-slate-800 md:border-transparent"
                                        title="Edit Intelligence"
                                    >
                                        <Edit3 className="w-5 h-5 md:w-4 md:h-4" />
                                    </button>
                                </div>
                                <a
                                    href={`/article/${article.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 text-slate-400 hover:bg-white/5 rounded-xl transition-all flex items-center gap-2 group/btn"
                                >
                                    <span className="md:hidden text-[10px] font-black uppercase tracking-widest">Preview</span>
                                    <ExternalLink className="w-5 h-5 md:w-4 md:h-4 group-hover/btn:text-blue-400" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 px-6 py-4 bg-slate-900/30 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    Page {artPage} / {articleData?.pages || 1}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        disabled={artPage <= 1}
                        onClick={() => setArtPage(p => p - 1)}
                        className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-black text-slate-400 uppercase tracking-widest disabled:opacity-30 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                    >
                        Prev
                    </button>
                    <button
                        disabled={artPage >= (articleData?.pages || 1)}
                        onClick={() => setArtPage(p => p + 1)}
                        className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-black text-slate-400 uppercase tracking-widest disabled:opacity-30 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Floating Selection Bar - Mobile Optimized */}
            {selectedArticles.length > 0 && (
                <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300 w-[95%] max-w-2xl md:w-auto">
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-primary-500/30 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <div className="flex items-center justify-between w-full md:w-auto">
                            <div className="flex flex-col">
                                <div className="text-[9px] md:text-[10px] font-black text-primary-400 uppercase tracking-widest text-left">Selection Active</div>
                                <div className="text-white font-black text-xs md:text-sm">{selectedArticles.length} Article{selectedArticles.length > 1 ? 's' : ''} Targeted</div>
                            </div>
                            <button
                                onClick={() => setSelectedArticles([])}
                                className="md:hidden p-2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="hidden md:block h-8 w-px bg-slate-800"></div>

                        <div className="w-full md:flex-1 md:min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Add Editor's Note (Optional)..."
                                value={customNote}
                                onChange={(e) => setCustomNote(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 text-[10px] md:text-xs text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-primary-500/50 transition-all font-bold"
                            />
                        </div>

                        <div className="hidden md:block h-8 w-px bg-slate-800"></div>

                        <button
                            onClick={handleManualDeploy}
                            disabled={isDeploying}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-primary-500/20 active:scale-95 group"
                        >
                            {isDeploying ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span className="md:hidden text-[9px]">Sending...</span>
                                    <span className="hidden md:inline">Deploying...</span>
                                </span>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    <span>Send Newsletter</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
