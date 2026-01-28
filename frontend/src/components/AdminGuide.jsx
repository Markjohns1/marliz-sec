import React, { useState } from 'react';
import { ChevronDown, Target, Clock, Users, BarChart3, Zap, PenLine, Shield } from 'lucide-react';

export default function AdminGuide() {
    const [openSection, setOpenSection] = useState(0);

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? -1 : index);
    };

    const sections = [
        {
            title: "The Core Metrics & What They Mean",
            icon: BarChart3,
            color: "text-blue-400",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300">Understanding your data is the first step to traffic growth.</p>
                    <div className="grid gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-white mb-1">Views</h4>
                            <p className="text-sm text-slate-400">Actual humans reading the article.</p>
                            <div className="mt-2 text-xs font-mono bg-slate-900 p-2 rounded text-emerald-400">
                                Action: High Views? Write more on this topic. Low Views? Audit interest.
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-white mb-1">Impressions</h4>
                            <p className="text-sm text-slate-400">People saw the link on Google but didn't click.</p>
                            <div className="mt-2 text-xs font-mono bg-slate-900 p-2 rounded text-amber-400">
                                Formula: High Impressions + Low Views = BAD TITLE. Rewrite it!
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-white mb-1">Position (Pos)</h4>
                            <p className="text-sm text-slate-400">Average rank on Google Search.</p>
                            <ul className="mt-2 text-xs text-slate-400 space-y-1 list-disc pl-4">
                                <li><span className="text-emerald-400">1-3:</span> Winning. Don't touch.</li>
                                <li><span className="text-yellow-400">4-10:</span> THE STRIKE ZONE (Optimize immediately).</li>
                                <li><span className="text-red-400">{' > '} 10:</span> Needs more content/keywords.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Editorial Strategy: From Draft to Diamond",
            icon: PenLine,
            color: "text-red-400",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300">The AI is your researcher. You are the Analyst. Never publish an AI draft without human intervention.</p>
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                        <h4 className="font-bold text-red-400 mb-2">The Content Golden Rules</h4>
                        <ul className="list-disc pl-4 text-sm text-slate-300 space-y-2">
                            <li><strong>Inject "Unpopular Opinions":</strong> Disagree with the news source. Add a critical angle.</li>
                            <li><strong>Rule of 3:</strong> Only process 3 articles per batch. Focus on quality, not volume.</li>
                            <li><strong>Clean the Slugs:</strong> Ensure the URL slug is sharp and keyword-rich.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "60-Second Editorial Mastery",
            icon: Zap,
            color: "text-amber-400",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-800/50 p-2 border-l-2 border-amber-500 inline-block">Quick Reference for Editors</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* THE ESSENTIALS */}
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                            <h5 className="text-blue-400 font-bold text-[10px] uppercase mb-3 tracking-widest">1. Structure (Markdown)</h5>
                            <div className="space-y-3 font-mono text-[11px]">
                                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span className="text-slate-500">Big Title</span>
                                    <code className="text-blue-300">## Heading</code>
                                </div>
                                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span className="text-slate-500">Sub Section</span>
                                    <code className="text-blue-300">### Sub-Head</code>
                                </div>
                                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span className="text-slate-500">Emphasis</span>
                                    <code className="text-blue-300">**Bold Text**</code>
                                </div>
                                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span className="text-slate-500">Section Line</span>
                                    <code className="text-blue-300">---</code>
                                </div>
                            </div>
                        </div>

                        {/* PREMIUM HACKS */}
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl">
                            <h5 className="text-amber-400 font-bold text-[10px] uppercase mb-3 tracking-widest">2. Pro Visuals (Copy & Paste)</h5>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[9px] text-slate-500 mb-1">Color a word <span className="text-red-500 font-bold">RED</span> (Critical):</p>
                                    <code className="block bg-black p-2 rounded text-[10px] text-red-400 select-all border border-red-900/30">
                                        &lt;span style="color:#ef4444"&gt;TEXT&lt;/span&gt;
                                    </code>
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-500 mb-1">Marker <span className="bg-blue-500/20 px-1 text-blue-300">HIGHLIGHT</span> (Important):</p>
                                    <code className="block bg-black p-2 rounded text-[10px] text-blue-300 select-all border border-blue-900/30">
                                        &lt;span style="background:rgba(59,130,246,0.2)"&gt;TEXT&lt;/span&gt;
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                        <h5 className="text-emerald-400 font-bold text-[10px] uppercase mb-2">The "Diamond" Prompt:</h5>
                        <p className="text-xs text-slate-400 italic">"Read AI draft -&gt; Add Verdict in a <strong>&gt; Quote block</strong> -&gt; Highlight critical in <strong>RED</strong> -&gt; Publish."</p>
                    </div>
                </div>
            )
        },
        {
            title: "Hiring Guide: Success Metrics",
            icon: Users,
            color: "text-purple-400",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300 italic text-sm">"Your job is to manage the Green Numbers, not just post text."</p>
                    <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                        <ul className="space-y-3 text-sm text-slate-300 font-medium">
                            <li className="flex items-center gap-3"><Clock className="w-4 h-4 text-purple-400" /> Spend 15 mins/day editing AI drafts.</li>
                            <li className="flex items-center gap-3"><Target className="w-4 h-4 text-purple-400" /> Move "Page 2" articles to "Page 1".</li>
                            <li className="flex items-center gap-3"><Shield className="w-4 h-4 text-purple-400" /> Verify 410 Gone links monthly.</li>
                        </ul>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Operations Playbook</h2>
                <p className="text-slate-400">The manual for high-performance dashboard management.</p>
            </div>

            <div className="space-y-3">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-700">
                        <button
                            onClick={() => toggleSection(idx)}
                            className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg bg-slate-800 ${section.color}`}>
                                    <section.icon className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-200 text-sm sm:text-base">{section.title}</span>
                            </div>
                            <ChevronDown
                                className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openSection === idx ? 'rotate-180 text-blue-400' : ''}`}
                            />
                        </button>

                        <div
                            className={`transition-all duration-300 ease-in-out ${openSection === idx ? 'max-h-[1000px] overflow-y-auto opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}
                        >
                            <div className="p-5 pt-0 border-t border-slate-800/50">
                                <div className="pt-4">
                                    {section.content}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
