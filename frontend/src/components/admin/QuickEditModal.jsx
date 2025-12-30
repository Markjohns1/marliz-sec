import React, { useState } from 'react';
import { Edit3, X, RefreshCw, Zap } from 'lucide-react';

export default function QuickEditModal({ article, onClose, onSave }) {
    const [draftTitle, setDraftTitle] = useState(article.draft_title || article.title);
    const [draftMeta, setDraftMeta] = useState(article.draft_meta_description || article.meta_description || '');
    const [draftKeywords, setDraftKeywords] = useState(article.draft_keywords || article.keywords || '');
    const [saving, setSaving] = useState(false);

    const handleAction = async (isPublish) => {
        setSaving(true);
        try {
            await onSave(article.id, {
                draft_title: draftTitle,
                draft_meta_description: draftMeta,
                draft_keywords: draftKeywords,
                publish_now: isPublish,
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

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-primary-400" />
                        <h3 className="font-bold text-white">Quick SEO Edit</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">SEO Title (Target 60 chars)</label>
                        <input
                            type="text"
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-white"
                            placeholder="Enter catchy SEO title..."
                        />
                        <div className="mt-1 text-[10px] text-right text-slate-500 font-bold">{draftTitle.length}/60</div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Meta Description (Target 160 chars)</label>
                        <textarea
                            value={draftMeta}
                            onChange={(e) => setDraftMeta(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm text-white"
                            placeholder="Hook + Details + Call to Action..."
                        />
                        <div className="mt-1 text-[10px] text-right text-slate-500 font-bold">{draftMeta.length}/160</div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Keywords (Comma separated)</label>
                        <input
                            type="text"
                            value={draftKeywords}
                            onChange={(e) => setDraftKeywords(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm text-white"
                            placeholder="keyword1, keyword2, keyword3..."
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${article.has_draft ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {article.has_draft ? 'Has unpublished changes' : 'Live version synced'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAction(false)}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors disabled:opacity-50"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={() => handleAction(true)}
                            disabled={saving}
                            className="btn-primary text-sm flex items-center gap-2 px-6 py-2"
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Save & Publish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
