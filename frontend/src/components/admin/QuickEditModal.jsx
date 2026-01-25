import React, { useState } from 'react';
import { Edit3, X, RefreshCw, Zap, Layout, FileText, ListChecks, ShieldAlert, Plus, Trash2 } from 'lucide-react';

export default function QuickEditModal({ article, onClose, onSave }) {
    const [activeSubTab, setActiveSubTab] = useState('seo'); // seo, content

    // SEO States
    const [draftTitle, setDraftTitle] = useState(article.draft_title || article.title);
    const [draftMeta, setDraftMeta] = useState(article.draft_meta_description || article.meta_description || '');
    const [draftKeywords, setDraftKeywords] = useState(article.draft_keywords || article.keywords || '');
    const [imageUrl, setImageUrl] = useState(article.image_url || '');
    const [originalUrl, setOriginalUrl] = useState(article.original_url || '');

    // Content States
    const [summary, setSummary] = useState(article.simplified?.friendly_summary || '');
    const [impact, setImpact] = useState(article.simplified?.business_impact || '');
    const [vector, setVector] = useState(article.simplified?.attack_vector || '');
    const [threatLevel, setThreatLevel] = useState(article.simplified?.threat_level || 'medium');
    const [actionSteps, setActionSteps] = useState(() => {
        try {
            return article.simplified?.action_steps ? JSON.parse(article.simplified.action_steps) : ['', ''];
        } catch (e) {
            return ['', ''];
        }
    });

    const [saving, setSaving] = useState(false);

    const handleAction = async (isPublish) => {
        setSaving(true);
        try {
            await onSave(article.id, {
                // SEO
                draft_title: draftTitle,
                draft_meta_description: draftMeta,
                draft_keywords: draftKeywords,

                // Content (Direct updates)
                friendly_summary: summary,
                business_impact: impact,
                attack_vector: vector,
                action_steps: JSON.stringify(actionSteps.filter(s => s.trim())),
                threat_level: threatLevel,

                publish_now: isPublish,
                image_url: imageUrl,
                original_url: originalUrl,
                edited_by: 'admin'
            });
            if (isPublish) {
                alert('Published! Changes should be live in a few minutes.');
            } else {
                alert('Draft saved successfully!');
            }
            onClose();
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const wordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-500/10 rounded-2xl">
                            <Edit3 className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight leading-none">Full Intel Editor</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Refining Article #{article.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors border border-transparent hover:border-slate-700">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Sub-Tabs */}
                <div className="flex px-8 bg-slate-950/50 border-b border-slate-800">
                    <button
                        onClick={() => setActiveSubTab('seo')}
                        className={`px-6 py-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeSubTab === 'seo' ? 'border-primary-500 text-primary-400 bg-primary-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <Layout className="w-4 h-4" />
                        SEO & Meta
                    </button>
                    <button
                        onClick={() => setActiveSubTab('content')}
                        className={`px-6 py-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeSubTab === 'content' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <FileText className="w-4 h-4" />
                        Intelligence Content
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-8 space-y-8 overflow-y-auto no-scrollbar flex-1">
                    {activeSubTab === 'seo' ? (
                        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="space-y-2">
                                <label className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                                    <span>SEO Title</span>
                                    <span className={`${draftTitle.length > 70 ? 'text-red-400' : 'text-slate-600'}`}>{draftTitle.length}/60-70</span>
                                </label>
                                <input
                                    type="text"
                                    value={draftTitle}
                                    onChange={(e) => setDraftTitle(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-lg text-white placeholder:text-slate-700"
                                    placeholder="Enter premium SEO title..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                                    <span>Meta Description</span>
                                    <span className={`${draftMeta.length > 165 ? 'text-red-400' : 'text-slate-600'}`}>{draftMeta.length}/160</span>
                                </label>
                                <textarea
                                    value={draftMeta}
                                    onChange={(e) => setDraftMeta(e.target.value)}
                                    rows={3}
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-base text-slate-200 placeholder:text-slate-700 leading-relaxed"
                                    placeholder="High-converting meta description..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Keywords</label>
                                <input
                                    type="text"
                                    value={draftKeywords}
                                    onChange={(e) => setDraftKeywords(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm font-bold text-slate-400 placeholder:text-slate-700"
                                    placeholder="cybersecurity, data breach, protection..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Featured Image URL</label>
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-xs font-bold text-slate-400"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Original Source URL</label>
                                    <input
                                        type="text"
                                        value={originalUrl}
                                        onChange={(e) => setOriginalUrl(e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-xs font-bold text-slate-400"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Threat Level</label>
                                    <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                                        {['low', 'medium', 'high', 'critical'].map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={() => setThreatLevel(lvl)}
                                                className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${threatLevel === lvl
                                                    ? (lvl === 'low' ? 'bg-emerald-500 text-white' :
                                                        lvl === 'medium' ? 'bg-blue-500 text-white' :
                                                            lvl === 'high' ? 'bg-amber-500 text-white' :
                                                                'bg-red-500 text-white')
                                                    : 'text-slate-600 hover:text-slate-400'
                                                    }`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 italic text-slate-600">Article Analysis</label>
                                    <div className="flex items-center gap-4 h-[42px] px-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                                        <div className="flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4 text-primary-500" />
                                            <span className="text-[10px] font-black uppercase text-slate-400">Total Words: {wordCount(summary + impact + vector + actionSteps.join(' '))}</span>
                                        </div>
                                        <div className="h-4 w-px bg-slate-800" />
                                        <span className={`text-[10px] font-black uppercase ${wordCount(summary + impact + vector + actionSteps.join(' ')) >= 1000 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {wordCount(summary + impact + vector + actionSteps.join(' ')) >= 1000 ? 'AdSense Optimized' : 'Needs More Depth'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                                    <span>Main Intelligence Summary (The depth)</span>
                                    <span className={`font-black uppercase ${wordCount(summary) < 800 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        Words: {wordCount(summary)}
                                    </span>
                                </label>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows={10}
                                    className="w-full px-6 py-5 rounded-[2rem] bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base text-slate-300 leading-relaxed"
                                    placeholder="Explain the technical details here..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Technical Analysis & Mechanics</label>
                                    <textarea
                                        value={vector}
                                        onChange={(e) => setVector(e.target.value)}
                                        rows={4}
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-slate-400"
                                        placeholder="Phishing, Zero-day, Credential theft..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Impact & Risks</label>
                                    <textarea
                                        value={impact}
                                        onChange={(e) => setImpact(e.target.value)}
                                        rows={4}
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-slate-400"
                                        placeholder="Financial loss, data theft..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                                    <span>What to Do RIGHT NOW (Action Steps)</span>
                                    <button
                                        onClick={() => setActionSteps([...actionSteps, ''])}
                                        className="text-primary-400 hover:text-primary-300 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </label>
                                <div className="space-y-3">
                                    {actionSteps.map((step, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex-1 relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">
                                                    {idx + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={step}
                                                    onChange={(e) => {
                                                        const newSteps = [...actionSteps];
                                                        newSteps[idx] = e.target.value;
                                                        setActionSteps(newSteps);
                                                    }}
                                                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm text-slate-300"
                                                    placeholder="Enter mitigation step..."
                                                />
                                                {actionSteps.length > 1 && (
                                                    <button
                                                        onClick={() => setActionSteps(actionSteps.filter((_, i) => i !== idx))}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:text-red-400 text-slate-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-950 border-t border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${article.has_draft ? 'bg-amber-500 animate-pulse shadow-lg shadow-amber-500/20' : 'bg-emerald-500 shadow-lg shadow-emerald-500/20'}`} />
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {article.has_draft ? 'Has unpublished changes' : 'Live version synced'}
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleAction(false)}
                            disabled={saving}
                            className="px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all disabled:opacity-50"
                        >
                            Save Draft Only
                        </button>
                        <button
                            onClick={() => handleAction(true)}
                            disabled={saving}
                            className="flex items-center gap-3 px-10 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Commit Changes & Push Live
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
