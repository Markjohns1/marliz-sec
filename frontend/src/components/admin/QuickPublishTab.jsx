import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    PenLine,
    ChevronDown,
    ChevronRight,
    AlertTriangle,
    Shield,
    Info,
    CheckCircle,
    Loader2,
    Plus,
    Trash2,
    Zap,
    ExternalLink
} from 'lucide-react';
import { getCategories, createManualArticle } from '../../services/api';

const THREAT_LEVELS = [
    { value: 'low', label: 'Low Risk', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { value: 'medium', label: 'Medium Risk', icon: Info, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { value: 'high', label: 'High Risk', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { value: 'critical', label: 'Critical Alert', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10' },
];

export default function QuickPublishTab({ onPublishSuccess }) {
    // Form State
    const [step, setStep] = useState(1); // Progressive disclosure
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [publishedSlug, setPublishedSlug] = useState(null);

    // Form Fields
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [threatLevel, setThreatLevel] = useState('medium');
    const [summary, setSummary] = useState('');
    const [vector, setVector] = useState('');
    const [impact, setImpact] = useState('');
    const [actionSteps, setActionSteps] = useState(['', '']);
    const [sourceUrl, setSourceUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [keywords, setKeywords] = useState('');

    // Fetch categories
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories
    });

    // Auto-advance steps as fields are filled
    useEffect(() => {
        if (title.length > 10 && step === 1) setStep(2);
    }, [title]);

    useEffect(() => {
        if (categoryId && threatLevel && step === 2) setStep(3);
    }, [categoryId, threatLevel]);

    useEffect(() => {
        if (summary.length > 50 && step === 3) setStep(4);
    }, [summary]);

    useEffect(() => {
        if (impact.length > 30 && step === 4) setStep(5);
    }, [impact]);

    useEffect(() => {
        if (vector.length > 50 && step === 5) setStep(6);
    }, [vector]);

    const addActionStep = () => {
        if (actionSteps.length < 5) {
            setActionSteps([...actionSteps, '']);
        }
    };

    const removeActionStep = (index) => {
        if (actionSteps.length > 2) {
            setActionSteps(actionSteps.filter((_, i) => i !== index));
        }
    };

    const updateActionStep = (index, value) => {
        const updated = [...actionSteps];
        updated[index] = value;
        setActionSteps(updated);
    };

    const resetForm = () => {
        setTitle('');
        setCategoryId('');
        setThreatLevel('medium');
        setSummary('');
        setVector('');
        setImpact('');
        setActionSteps(['', '']);
        setSourceUrl('');
        setImageUrl('');
        setMetaDescription('');
        setKeywords('');
        setStep(1);
        setPublishedSlug(null);
    };

    const handleSubmit = async () => {
        // Validate
        const filledSteps = actionSteps.filter(s => s.trim().length > 0);
        if (filledSteps.length < 2) {
            setMessage({ type: 'error', text: 'Please provide at least 2 action steps.' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            const payload = {
                title,
                category_id: parseInt(categoryId),
                threat_level: threatLevel,
                friendly_summary: summary,
                attack_vector: vector,
                business_impact: impact,
                action_steps: filledSteps,
                original_url: sourceUrl || null,
                image_url: imageUrl || null,
                meta_description: metaDescription || null,
                keywords: keywords || null,
                source_name: 'Marliz Intel Staff',
                admin_secret: localStorage.getItem('admin_api_key')
            };

            const result = await createManualArticle(payload);
            setMessage({ type: 'success', text: `✅ Article published successfully!` });
            setPublishedSlug(result.slug);
            if (onPublishSuccess) onPublishSuccess();
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.response?.data?.detail || error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = title.length >= 10 && categoryId && summary.length >= 50 && impact.length >= 30 && vector.length >= 50 && actionSteps.filter(s => s.trim()).length >= 2;

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
                        Manually create an article with the Marliz Intel format
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
                    {/* Step 1: Title */}
                    <div className="p-6 border-b border-slate-800">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
                            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">1</span>
                            Headline
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., ALERT: Company Name Confirms Data Breach..."
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-lg"
                            autoFocus
                        />
                        <p className="text-xs text-slate-500 mt-2">{title.length}/500 characters (min 10)</p>
                    </div>

                    {/* Step 2: Category & Threat Level */}
                    {step >= 2 && (
                        <div className="p-6 border-b border-slate-800 grid sm:grid-cols-2 gap-6 animate-fade-in">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
                                    <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">2</span>
                                    Category
                                </label>
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
                                <label className="text-sm font-bold text-slate-300 mb-3 block">Threat Level</label>
                                <div className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-2">
                                    {THREAT_LEVELS.map(level => (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => setThreatLevel(level.value)}
                                            className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${threatLevel === level.value
                                                ? `${level.bg} border-current ${level.color}`
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                                }`}
                                        >
                                            <level.icon className="w-4 h-4" />
                                            {level.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Summary */}
                    {step >= 3 && (
                        <div className="p-6 border-b border-slate-800 animate-fade-in">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
                                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">3</span>
                                What Happened? (Summary)
                            </label>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="Explain what happened in plain English. Who was affected? What was compromised?"
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">{summary.length} characters (min 50)</p>
                        </div>
                    )}

                    {/* Step 4: Business Impact */}
                    {step >= 4 && (
                        <div className="p-6 border-b border-slate-800 animate-fade-in">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
                                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">4</span>
                                Why Does This Matter? (Impact)
                            </label>
                            <textarea
                                value={impact}
                                onChange={(e) => setImpact(e.target.value)}
                                placeholder="Explain the business and personal impact. Who is at risk? What could happen if ignored?"
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                            />
                        </div>
                    )}

                    {/* Step 5: Technical Analysis */}
                    {step >= 5 && (
                        <div className="p-6 border-b border-slate-800 animate-fade-in">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
                                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">5</span>
                                Technical Analysis & Mechanics
                            </label>
                            <textarea
                                value={vector}
                                onChange={(e) => setVector(e.target.value)}
                                placeholder="Provide the technical deep-dive. Kill chain, CVEs, or complex mechanics..."
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">{vector.length} characters (min 50)</p>
                        </div>
                    )}

                    {/* Step 6: Final Review - Actions, SEO, and Publishing */}
                    {step >= 6 && (
                        <div className="animate-fade-in divide-y divide-slate-800/50">
                            {/* Actions Part */}
                            <div className="p-6">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
                                    <span className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-xs text-white">6</span>
                                    Recommended Action Steps
                                </label>
                                <div className="space-y-4 mb-4">
                                    {actionSteps.map((step, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="text-emerald-400 font-bold text-sm w-4">{index + 1}.</span>
                                            <input
                                                type="text"
                                                value={step}
                                                onChange={(e) => updateActionStep(index, e.target.value)}
                                                placeholder={`Action step ${index + 1}...`}
                                                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                            />
                                            {actionSteps.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeActionStep(index)}
                                                    className="p-2 text-slate-500 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {actionSteps.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={addActionStep}
                                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Step
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* SEO Part */}
                            <div className="p-6 space-y-6 bg-slate-950/30">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                    <Zap className="w-3 h-3 text-blue-500" />
                                    SEO & Meta Configuration
                                </label>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter ml-1">Original Source URL</label>
                                        <input
                                            type="url"
                                            value={sourceUrl}
                                            onChange={(e) => setSourceUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter ml-1">Featured Image URL</label>
                                        <input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
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
                            </div>

                            {/* Final Submission */}
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
                </div>
            )}

            {/* Progress Indicator */}
            {!publishedSlug && (
                <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map(s => (
                        <div
                            key={s}
                            className={`w-2 h-2 rounded-full transition-all ${step >= s ? 'bg-blue-500' : 'bg-slate-700'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
