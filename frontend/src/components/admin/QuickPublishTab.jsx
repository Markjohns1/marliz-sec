import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    PenLine,
    CheckCircle,
    Loader2,
    Zap,
    ExternalLink,
    Plus,
    ShieldAlert,
    Layout,
    Cloud
} from 'lucide-react';
import { getCategories, createManualArticle } from '../../services/api';
import MediaPickerModal from './MediaPickerModal';

const THREAT_LEVELS = [
    { value: 'low', label: 'Low', color: 'text-emerald-400', active: 'bg-emerald-500 text-white' },
    { value: 'medium', label: 'Medium', color: 'text-blue-400', active: 'bg-blue-500 text-white' },
    { value: 'high', label: 'High', color: 'text-amber-400', active: 'bg-amber-500 text-white' },
    { value: 'critical', label: 'Critical', color: 'text-red-400', active: 'bg-red-500 text-white' },
];

export default function QuickPublishTab({ onPublishSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [publishedSlug, setPublishedSlug] = useState(null);
    const [customSlug, setCustomSlug] = useState('');
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

    // Core Fields
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [threatLevel, setThreatLevel] = useState('medium');
    const [contentMarkdown, setContentMarkdown] = useState('');

    // SEO Fields
    const [sourceUrl, setSourceUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [keywords, setKeywords] = useState('');

    // Fetch categories
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories
    });

    const wordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

    const resetForm = () => {
        setTitle('');
        setCategoryId('');
        setThreatLevel('medium');
        setContentMarkdown('');
        setSourceUrl('');
        setImageUrl('');
        setMetaDescription('');
        setKeywords('');
        setCustomSlug('');
        setPublishedSlug(null);
        setMessage(null);
    };

    const handleSubmit = async () => {
        if (!title || title.length < 10) {
            setMessage({ type: 'error', text: 'Title must be at least 10 characters.' });
            return;
        }
        if (!categoryId) {
            setMessage({ type: 'error', text: 'Please select a category.' });
            return;
        }
        if (!contentMarkdown || contentMarkdown.trim().length < 50) {
            setMessage({ type: 'error', text: 'Intelligence report must be at least 50 characters.' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            const payload = {
                title,
                category_id: parseInt(categoryId),
                threat_level: threatLevel,
                content_markdown: contentMarkdown,
                original_url: sourceUrl || null,
                image_url: imageUrl || null,
                meta_description: metaDescription || null,
                keywords: keywords || null,
                slug: customSlug || null,
                source_name: 'Marliz Intel Staff',
                admin_secret: localStorage.getItem('admin_api_key')
            };

            const result = await createManualArticle(payload);
            setMessage({ type: 'success', text: '✅ Article published successfully!' });
            setPublishedSlug(result.slug);
            if (onPublishSuccess) onPublishSuccess();
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.response?.data?.detail || error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = title.length >= 10 && categoryId && contentMarkdown.trim().length >= 50;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                            <PenLine className="w-5 h-5 text-white" />
                        </div>
                        Quick Publish
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Write and publish an intelligence report directly
                    </p>
                </div>
                {publishedSlug && (
                    <button
                        onClick={resetForm}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Article
                    </button>
                )}
            </div>

            {/* Success State */}
            {publishedSlug && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Article Published!</h3>
                    <p className="text-slate-400 mb-6">Your article is now live on Marliz Intel.</p>
                    <div className="flex items-center justify-center gap-4">
                        <a
                            href={`/article/${publishedSlug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium flex items-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Article
                        </a>
                        <button
                            onClick={resetForm}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium"
                        >
                            Create Another
                        </button>
                    </div>
                </div>
            )}

            {/* Form */}
            {!publishedSlug && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">

                    {/* Title */}
                    <div className="p-6 border-b border-slate-800">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 mb-2">Headline</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., ALERT: Company Name Confirms Data Breach..."
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-lg font-bold"
                            autoFocus
                        />
                        <p className="text-xs text-slate-500 mt-2">{title.length}/500 characters (min 10)</p>
                    </div>

                    {/* Category & Threat Level */}
                    <div className="p-6 border-b border-slate-800 grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 mb-2">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Select Category</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 mb-2">Threat Level</label>
                            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                                {THREAT_LEVELS.map(lvl => (
                                    <button
                                        key={lvl.value}
                                        onClick={() => setThreatLevel(lvl.value)}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${threatLevel === lvl.value ? lvl.active : 'text-slate-600 hover:text-slate-400'
                                            }`}
                                    >
                                        {lvl.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* THE BIG MARKDOWN EDITOR */}
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                                Intelligence Report (Markdown)
                            </label>
                            <div className="flex items-center gap-4">
                                <span className={`text-[10px] font-black uppercase ${wordCount(contentMarkdown) >= 1000 ? 'text-emerald-500' : wordCount(contentMarkdown) > 0 ? 'text-amber-500' : 'text-slate-600'}`}>
                                    Words: {wordCount(contentMarkdown)}
                                </span>
                                {wordCount(contentMarkdown) >= 1000 && (
                                    <span className="text-[9px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">AdSense Ready</span>
                                )}
                            </div>
                        </div>
                        <textarea
                            value={contentMarkdown}
                            onChange={(e) => setContentMarkdown(e.target.value)}
                            rows={20}
                            className="w-full px-6 py-5 rounded-2xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base text-slate-300 font-mono leading-relaxed"
                            placeholder="Write your full intelligence report here in Markdown...

## What Happened

## Technical Analysis

## Who Is Affected

## What You Should Do Now"
                        />
                    </div>

                    {/* SEO & Meta - Collapsible Style */}
                    <div className="p-6 space-y-4 bg-slate-950/30 border-b border-slate-800">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            <Layout className="w-3 h-3 text-blue-500" />
                            SEO & Meta Configuration
                        </label>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter ml-1">Custom URL Slug</label>
                                <input
                                    type="text"
                                    value={customSlug}
                                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/ /g, '-'))}
                                    placeholder="e.g. ai-chatbot-breach-2026"
                                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-600 text-xs font-mono"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter ml-1">Featured Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 text-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsMediaPickerOpen(true)}
                                        className="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-blue-900/40"
                                    >
                                        <Cloud className="w-3 h-3" />
                                        Vault
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-tighter px-1">
                                <span>Meta Description</span>
                                <span className={`${metaDescription.length > 165 ? 'text-red-400' : 'text-slate-700'}`}>{metaDescription.length}/160</span>
                            </label>
                            <textarea
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 text-xs resize-none leading-relaxed"
                                placeholder="High-converting summary for Google..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[9px] font-black text-slate-600 uppercase tracking-tighter px-1">Keywords</label>
                            <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 text-xs font-bold"
                                placeholder="cybersecurity, data breach, protection..."
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="p-8 bg-slate-900/60 flex flex-col items-center">
                        {message && (
                            <div className={`w-full mb-6 p-4 rounded-xl text-sm font-bold text-center ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                {message.text}
                            </div>
                        )}
                        <div className="max-w-md w-full">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] text-center mb-6">Article Ready for Deployment</p>
                            <button
                                onClick={handleSubmit}
                                disabled={!isFormValid || isSubmitting}
                                className={`w-full py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-4 transition-all active:scale-[0.98] ${isFormValid && !isSubmitting
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xl shadow-blue-500/20'
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Deploying Intel...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 fill-current" />
                                        Push Article Live Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <MediaPickerModal
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={(url) => setImageUrl(url)}
            />
        </div>
    );
}
