import React, { useState } from 'react';
import { Share2, X, Copy } from 'lucide-react';

export default function ShareModal({ article, onClose }) {
    const [copied, setCopied] = useState(null);
    const domain = window.location.origin;
    const articleUrl = `${domain}/article/${article.slug}`;

    const channels = [
        { name: 'WhatsApp', icon: '📲', s: 'w', color: 'text-emerald-400' },
        { name: 'Facebook', icon: '👤', s: 'f', color: 'text-blue-400' },
        { name: 'LinkedIn', icon: '💼', s: 'l', color: 'text-sky-400' },
        { name: 'X (Twitter)', icon: '𝕏', s: 'x', color: 'text-white' },
        { name: 'Telegram', icon: '✈️', s: 't', color: 'text-blue-500' },
    ];

    const copyToClipboard = (s) => {
        const trackedUrl = `${articleUrl}?s=${s}`;
        navigator.clipboard.writeText(trackedUrl);
        setCopied(s);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h3 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-blue-400" />
                        Intelligence Share Hub
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Select tracked channel:</p>
                    <div className="grid grid-cols-1 gap-2">
                        {channels.map((ch) => (
                            <button
                                key={ch.s}
                                onClick={() => copyToClipboard(ch.s)}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{ch.icon}</span>
                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white">{ch.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {copied === ch.s ? (
                                        <span className="text-[10px] font-black text-emerald-500 uppercase">Copied!</span>
                                    ) : (
                                        <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-slate-900/50 border-t border-slate-800 text-center">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Tracks every click back to this dashboard</p>
                </div>
            </div>
        </div>
    );
}
