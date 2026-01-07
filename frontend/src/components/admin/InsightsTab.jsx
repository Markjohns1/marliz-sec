import React from 'react';
import { FolderOpen, TrendingUp, Eye, Share2, Edit3, ExternalLink } from 'lucide-react';

export default function InsightsTab({ stats, setSharingArticle, setEditingArticle }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Insights Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Intelligence Insights</h2>
            </div>

            <div className="space-y-6">
                {stats?.categories_performance?.map((cat) => (
                    <div key={cat.name} className="card overflow-hidden">
                        {/* Category Header Stats */}
                        <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="w-10 h-10 rounded-2xl bg-primary-600/20 flex items-center justify-center text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-900/20">
                                    <FolderOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white uppercase tracking-tight">{cat.name}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{cat.count} Operations</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 justify-around w-full sm:w-auto py-2 sm:py-0 border-t sm:border-t-0 border-slate-800">
                                <div className="text-center">
                                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Total Impact</div>
                                    <div className="text-sm font-black text-primary-400">{cat.total_views.toLocaleString()}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Avg Visibility</div>
                                    <div className={`text-sm font-black ${cat.avg_position < 10 && cat.avg_position > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {cat.avg_position > 0 ? cat.avg_position.toFixed(1) : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Articles Table */}
                        <div className="p-2">
                            <div className="text-[9px] px-4 py-3 text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="w-3 h-3" />
                                Priority Intel
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-slate-800/30">
                                        {cat.top_articles?.map((article, idx) => (
                                            <tr key={article.id} className="group hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-sm font-bold text-slate-200 line-clamp-1 group-hover:text-primary-400 transition-colors">
                                                            {article.title}
                                                        </div>
                                                        {idx === 0 && (
                                                            <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-tighter border border-emerald-500/20">Elite</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-6">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                                                            <Eye className="w-3 h-3 text-primary-400" />
                                                            <span className="text-slate-300">{article.views.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 transition-all">
                                                            <button
                                                                onClick={() => setSharingArticle(article)}
                                                                className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                                                                title="Tracked Share"
                                                            >
                                                                <Share2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingArticle(article)}
                                                                className="p-1.5 text-primary-400 hover:bg-primary-500/10 rounded-lg"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <a
                                                                href={`/article/${article.slug}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-1.5 text-slate-500 hover:bg-white/5 rounded-lg"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
