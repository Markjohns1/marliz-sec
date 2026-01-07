import QuickSearch from '../QuickSearch';
import { useState } from 'react';
import { triggerNewsletterDigest } from '../../services/api';
import {
    Clock, FileText, BarChart3, Share2,
    Edit3, ExternalLink, Send, CheckSquare, Square
} from 'lucide-react';

export default function ArticlesTab({
    artSearch, setArtSearch, setArtPage, artSort, setArtSort,
    artLoading, articleData, artPage,
    setViewingStats, setSharingArticle, setEditingArticle
}) {
    const [selectedArticles, setSelectedArticles] = useState([]);
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

        setIsDeploying(true);
        try {
            const res = await triggerNewsletterDigest(selectedArticles);
            alert(res.message);
            setSelectedArticles([]);
        } catch (err) {
            console.error(err);
            alert("Failed to deploy digest. Check console for logs.");
        } finally {
            setIsDeploying(false);
        }
    };
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        onChange={(e) => setArtSort(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer hover:bg-slate-800"
                    >
                        <option value="date">Most Recent</option>
                        <option value="views">High Traffic</option>
                        <option value="impressions">SEO Impressions</option>
                        <option value="position">GSC Visibility</option>
                    </select>
                </div>
            </div>

            {/* Article Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-800">
                                <th className="px-6 py-4 w-12">
                                    <div className="flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Intelligence Report</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Metrics</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {artLoading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-bold italic">Scanning database...</td></tr>
                            ) : articleData?.articles.map((article) => (
                                <tr
                                    key={article.id}
                                    className={`hover:bg-white/5 transition-colors group ${selectedArticles.includes(article.id) ? 'bg-primary-500/5' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleSelection(article.id)}
                                            className={`p-2 rounded-lg transition-all ${selectedArticles.includes(article.id) ? 'text-primary-400' : 'text-slate-700 hover:text-slate-500'}`}
                                        >
                                            {selectedArticles.includes(article.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 max-w-md">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-bold text-white group-hover:text-primary-400 transition-colors truncate max-w-[300px] lg:max-w-md">
                                                    {article.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[9px] font-black text-slate-500 border border-slate-800 uppercase tracking-tighter">
                                                    {article.category?.name || 'General'}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                                                    <Clock className="w-3 h-3" />
                                                    {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Draft'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-6">
                                            <div className="text-center">
                                                <div className="text-[9px] text-slate-500 font-black uppercase mb-0.5">Views</div>
                                                <div className="text-xs font-black text-primary-400">{article.views.toLocaleString()}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[9px] text-slate-500 font-black uppercase mb-0.5">Pos</div>
                                                <div className={`text-xs font-black ${article.position < 10 && article.position > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                    {article.position > 0 ? article.position.toFixed(1) : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
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
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 transition-all">
                                            <button
                                                onClick={() => setViewingStats(article)}
                                                className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all border border-transparent hover:border-emerald-500/20"
                                                title="Intel Breakdown"
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setSharingArticle(article)}
                                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all border border-transparent hover:border-blue-500/20"
                                                title="Tracked Share"
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingArticle(article)}
                                                className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all border border-transparent hover:border-primary-500/20"
                                                title="Full Intel Editor"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <a
                                                href={`/article/${article.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-slate-500 hover:bg-white/5 rounded-xl transition-all"
                                                title="Preview"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-800 flex items-center justify-between">
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
            </div>

            {/* Floating Selection Bar */}
            {selectedArticles.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-primary-500/30 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] px-6 py-4 rounded-3xl flex items-center gap-8 min-w-[320px]">
                        <div className="flex flex-col">
                            <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Selection Active</div>
                            <div className="text-white font-black text-sm">{selectedArticles.length} Article{selectedArticles.length > 1 ? 's' : ''} Targeted</div>
                        </div>

                        <div className="h-8 w-px bg-slate-800"></div>

                        <button
                            onClick={handleManualDeploy}
                            disabled={isDeploying}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-primary-500/20 active:scale-95 group"
                        >
                            {isDeploying ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Deploying...
                                </span>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    Send Newsletter
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
