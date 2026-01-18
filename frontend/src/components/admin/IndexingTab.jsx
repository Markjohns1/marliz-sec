import React, { useState } from 'react';
import { Globe, Shield, Zap, Search, ChevronRight, Activity, Layers, Terminal, RefreshCw } from 'lucide-react';
import { requestStaticUrlIndexing, requestCategoryIndexing } from '../../services/api';

export default function IndexingTab({ stats }) {
    const [indexingPath, setIndexingPath] = useState(null);
    const [message, setMessage] = useState(null);

    const handleIndex = async (type, identifier, label) => {
        setIndexingPath(identifier);
        setMessage(null);
        try {
            let res;
            if (type === 'static') {
                res = await requestStaticUrlIndexing(identifier);
            } else {
                res = await requestCategoryIndexing(identifier);
            }

            if (res.status === 'success') {
                setMessage({ type: 'success', text: `✓ ${label} pushed to Google!` });
            } else {
                setMessage({ type: 'error', text: `Failed: ${res.message}` });
            }
        } catch (err) {
            setMessage({ type: 'error', text: `Connection Error: ${err.message}` });
        } finally {
            setIndexingPath(null);
            // Clear success message after 5 seconds
            if (message?.type === 'success') {
                setTimeout(() => setMessage(null), 5000);
            }
        }
    };

    const corePages = [
        { name: 'Home Engine', path: '/', description: 'Main search and latest intelligence entry point', icon: Globe, priority: 'Critical' },
        { name: 'Threat Archive', path: '/all-threats', description: 'Full history of all cybersecurity signals', icon: Shield, priority: 'High' },
        { name: 'Intelligence Glossary', path: '/glossary', description: 'Terminology and technical definitions database', icon: Terminal, priority: 'Meta' },
        { name: 'About Marliz', path: '/about', description: 'Brand authority and methodology page', icon: Zap, priority: 'Medium' },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Globe className="w-6 h-6 text-blue-500" />
                    Global Indexing Center
                </h2>
                <p className="text-slate-500 text-sm font-medium mt-1 italic">Force Google to recognize your Authority Architecture.</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between border ${message.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    <div className="text-xs font-black uppercase tracking-widest">{message.text}</div>
                    <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100 uppercase text-[9px] font-black tracking-widest">Dismiss</button>
                </div>
            )}

            <div className="space-y-8">
                {/* Core Authority Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Core Authority Pages</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {corePages.map((page) => (
                            <div key={page.path} className="group bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <page.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter ${page.priority === 'Critical' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-500'
                                        }`}>
                                        {page.priority}
                                    </span>
                                </div>
                                <h4 className="font-bold text-white mb-1">{page.name}</h4>
                                <p className="text-[10px] text-slate-500 mb-4 line-clamp-2 italic font-medium">{page.description}</p>
                                <button
                                    onClick={() => handleIndex('static', page.path, page.name)}
                                    disabled={indexingPath === page.path}
                                    className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {indexingPath === page.path ? (
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Zap className="w-3 h-3 text-yellow-500" />
                                    )}
                                    Instant Index Page
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Intelligence Categories Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Intelligence Categories</h3>
                    </div>
                    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="divide-y divide-slate-800/50">
                            {stats?.categories_performance?.map((cat) => (
                                <div key={cat.name} className="flex items-center justify-between p-4 group hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <div>
                                            <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{cat.name}</div>
                                            <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest tabular-nums mt-0.5">
                                                /category/{cat.slug} • {cat.count} Published
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleIndex('category', cat.id, cat.name)}
                                        disabled={indexingPath === cat.id}
                                        className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl text-blue-400 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {indexingPath === cat.id ? (
                                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                        ) : (
                                            <Search className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            )) || (
                                    <div className="p-8 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        Scanning categories database...
                                    </div>
                                )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
