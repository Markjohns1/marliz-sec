import QuickSearch from '../QuickSearch';
import {
    Clock, FileText, BarChart3, Share2,
    Edit3, ExternalLink
} from 'lucide-react';

export default function ArticlesTab({
    artSearch, setArtSearch, setArtPage, artSort, setArtSort,
    artWordCount, setArtWordCount,
    artLoading, articleData, artPage,
    setViewingStats, setSharingArticle, setEditingArticle
}) {
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
                        value={artWordCount}
                        onChange={(e) => { setArtWordCount(e.target.value); setArtPage(1); }}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer hover:bg-slate-800"
                    >
                        <option value="all">Any Length</option>
                        <option value="<800">Below 800 Words</option>
                        <option value="800-1000">800 - 1000 Words</option>
                        <option value=">1000">1000+ Words</option>
                    </select>
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
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Intelligence Report</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Metrics</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {artLoading ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-bold italic">Scanning database...</td></tr>
                            ) : articleData?.articles.map((article) => (
                                <tr key={article.id} className="hover:bg-white/5 transition-colors group">
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
                                                {/* Word Count Indicator */}
                                                {article.simplified?.friendly_summary ? (
                                                    <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${article.simplified.friendly_summary.split(' ').length < 800 ? 'text-red-400' : 'text-emerald-500'
                                                        }`}>
                                                        <FileText className="w-3 h-3" />
                                                        {article.simplified.friendly_summary.split(' ').length} words
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] text-amber-500/50 font-black uppercase tracking-tighter">
                                                        <FileText className="w-3 h-3" />
                                                        Processing...
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => setEditingArticle(article)}
                                                    className="text-[10px] text-blue-400 font-black uppercase hover:underline"
                                                >
                                                    (Edit Content)
                                                </button>
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
                                                title="Quick SEO Edit"
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
        </div>
    );
}
