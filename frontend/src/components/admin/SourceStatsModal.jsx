import React, { useState, useEffect } from 'react';
import { BarChart3, X } from 'lucide-react';
import { getArticleStats } from '../../services/api';

export default function SourceStatsModal({ article, onClose }) {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getArticleStats(article.id);
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [article.id]);

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h3 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                        Intel Breakdown: {article.title.substring(0, 20)}...
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="py-12 text-center text-slate-500 font-bold italic text-xs animate-pulse">Analyzing traffic patterns...</div>
                    ) : stats.length > 0 ? (
                        <div className="space-y-3">
                            {stats.map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-xs font-bold text-slate-300">{s.platform}</span>
                                    </div>
                                    <span className="text-sm font-black text-white px-2 py-0.5 bg-slate-900 rounded-lg border border-slate-800">{s.hits} Hits</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">No specific source data recorded yet.</p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-900/50 border-t border-slate-800 text-center">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Granular Traffic Recognition</p>
                </div>
            </div>
        </div>
    );
}
