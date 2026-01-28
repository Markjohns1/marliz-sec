import React, { useState } from 'react';
import { ChevronDown, Target, Clock, Users, BarChart3, HelpCircle } from 'lucide-react';

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
                                <li><span className="text-red-400">&gt; 10:</span> Needs more content/keywords.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Strategic Workflows (The Strike Zone)",
            icon: Target,
            color: "text-red-400",
            content: (
                <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                        <h4 className="font-bold text-red-400 mb-2">Goal: Move Page 2 Articles to Page 1</h4>
                        <ol className="list-decimal pl-4 space-y-2 text-sm text-slate-300">
                            <li>Go to the <strong>Articles Tab</strong>.</li>
                            <li>Sort by <strong>Position</strong>.</li>
                            <li>Look for articles with Position <strong>4.0 to 12.0</strong>.</li>
                            <li><strong>Action:</strong> Open "Quick Edit". Add 1-2 paragraphs of recent news. Tweak the meta-description to be a question.</li>
                            <li><strong>Result:</strong> This often pushes them into the Top 3 positions.</li>
                        </ol>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-400 mb-2">The "Hook Fix" (Low Clicks)</h4>
                        <p className="text-sm text-slate-300 mb-2">If you have high impressions but low views, your title is boring.</p>
                        <div className="text-xs bg-slate-900 p-3 rounded">
                            <span className="text-red-400 line-through">Before: "Update on Cisco Router Vulnerability"</span><br />
                            <span className="text-emerald-400">After: "Cisco Warning: 50,000 Routers at Risk - Patch Now"</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Daily Routine for the Editor",
            icon: Clock,
            color: "text-purple-400",
            content: (
                <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex gap-3">
                        <span className="font-bold text-white">1.</span>
                        <span>
                            <strong>Check "Overview":</strong> Is Weekly Growth green? If red, you need a "Hit" article today. Check "All Threats".
                        </span>
                    </li>
                    <li className="flex gap-3">
                        <span className="font-bold text-white">2.</span>
                        <span>
                            <strong>Check "Pending AI":</strong> Review drafts. Use the Draft → Publish workflow. Quality &gt; Quantity.
                        </span>
                    </li>
                    <li className="flex gap-3">
                        <span className="font-bold text-white">3.</span>
                        <span>
                            <strong>Verify "Live":</strong> Click the Globe icon on your mobile bar to ensure the site looks perfect.
                        </span>
                    </li>
                </ul>
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
            title: "Pro-Formatting & Visual Mastery",
            icon: Edit3,
            color: "text-blue-400",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300 text-sm">Follow this guide to turn a plain AI draft into a world-class Intelligence Dispatch. No development skills required.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Column 1: Core Markdown */}
                        <div className="space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                                <h5 className="text-blue-400 font-bold text-xs mb-3 uppercase tracking-wider border-b border-slate-700 pb-2">1. Structural Hierarchy</h5>
                                <ul className="text-[11px] text-slate-400 space-y-2 font-mono">
                                    <li><code className="text-blue-300">## Major Heading</code> (H2)</li>
                                    <li><code className="text-blue-300">### Sub-Section</code> (H3)</li>
                                    <li><code className="text-blue-300">#### Detail Level</code> (H4)</li>
                                    <li><code className="text-blue-300">---</code> (Horizontal Divider Line)</li>
                                </ul>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                                <h5 className="text-emerald-400 font-bold text-xs mb-3 uppercase tracking-wider border-b border-slate-700 pb-2">2. Data & Citation</h5>
                                <ul className="text-[11px] text-slate-400 space-y-2 font-mono">
                                    <li><code className="text-emerald-300">- Bullet List</code></li>
                                    <li><code className="text-emerald-300">1. Numbered List</code></li>
                                    <li><code className="text-emerald-300">[Source Title](https://...)</code></li>
                                    <li><code className="text-emerald-300">| Table | Head |</code><br /><code>|---|---|</code><br /><code>| Row | Data |</code></li>
                                </ul>
                            </div>
                        </div>

                        {/* Column 2: HTML Hacks */}
                        <div className="space-y-4">
                            <div className="bg-slate-900/80 p-4 rounded border border-blue-500/20">
                                <h5 className="text-amber-400 font-bold text-xs mb-3 uppercase tracking-wider border-b border-slate-700 pb-2 font-sans">3. Visual "Hacks" (Copy & Paste)</h5>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase mb-1 font-sans font-bold">Color a single word or phrase:</p>
                                        <code className="text-[11px] block bg-black/40 p-2 rounded border border-slate-800 text-red-400">
                                            &lt;span style="color:#ef4444"&gt;CRITICAL&lt;/span&gt;
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase mb-1 font-sans font-bold">Highlight text (Marker effect):</p>
                                        <code className="text-[11px] block bg-black/40 p-2 rounded border border-slate-800 text-blue-300">
                                            &lt;span style="background:rgba(59,130,246,0.2)"&gt;Target Info&lt;/span&gt;
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase mb-1 font-sans font-bold">Force a manual Line Break:</p>
                                        <code className="text-[11px] block bg-black/40 p-2 rounded border border-slate-800 text-slate-400">
                                            &lt;br /&gt;
                                        </code>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                                <h5 className="text-purple-400 font-bold text-xs mb-3 uppercase tracking-wider border-b border-slate-700 pb-2">4. Code & Evidence</h5>
                                <ul className="text-[11px] text-slate-400 space-y-2 font-mono">
                                    <li><code className="text-purple-300">`Small Code`</code> (Inline)</li>
                                    <li><code className="text-purple-300">```<br />Code Block<br />```</code></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Hiring Guide: For the Next Admin",
            icon: Users,
            color: "text-purple-400",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300 italic">"Your job isn't just to post news. Your job is to manage the Green Numbers."</p>
                    <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                        <h4 className="font-bold text-white mb-2">The Success Checklist</h4>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Keep Weekly Growth positive.</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Verify every 410 Gone link in Search Console.</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Spend 15 minutes manually editing every AI draft.</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Never let a High-Impression article sit with a boring title.</li>
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
                                className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openSection === idx ? 'rotate-180 text-blue-400' : ''
                                    }`}
                            />
                        </button>

                        <div
                            className={`transition-all duration-300 ease-in-out ${openSection === idx ? 'max-h-[1000px] overflow-y-auto opacity-100' : 'max-h-0 overflow-hidden opacity-0'
                                }`}
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
