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
            title: "Markdown & Pro-Formatting Guide",
            icon: Edit3,
            color: "text-blue-400",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300 text-sm">Use these simple codes in the editor to make every article look unique.</p>
                    <div className="grid gap-3">
                        <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                            <h5 className="text-blue-400 font-bold text-xs mb-1 uppercase tracking-wider">Highlight & Emphasis</h5>
                            <ul className="text-xs text-slate-400 space-y-2">
                                <li><code>**Bold Text**</code> for emphasis.</li>
                                <li><code>*Italic Text*</code> for sidebars.</li>
                                <li><code>&gt; Text here</code> to create a professional quote/analyst note.</li>
                            </ul>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                            <h5 className="text-amber-400 font-bold text-xs mb-1 uppercase tracking-wider">Inline HTML Hacks (For anyone)</h5>
                            <ul className="text-xs text-slate-400 space-y-3">
                                <li>
                                    <p className="mb-1"><strong>Color Text:</strong> Use for "Critical" warnings.</p>
                                    <code>&lt;span style="color: #ef4444"&gt;CRITICAL WARNING&lt;/span&gt;</code>
                                </li>
                                <li>
                                    <p className="mb-1"><strong>Manual Spacing:</strong> Force a bigger gap between sections.</p>
                                    <code>&lt;br /&gt; &lt;br /&gt;</code>
                                </li>
                                <li>
                                    <p className="mb-1"><strong>Highlighting:</strong> Wrap text for a "marker" effect.</p>
                                    <code>&lt;span style="background: rgba(59,130,246,0.2); padding: 2px 4px"&gt;Highlight&lt;/span&gt;</code>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Hiring Guide: For the Next Admin",
            icon: Users,
            color: "text-emerald-400",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300 italic">"Your job isn't just to post news. Your job is to manage the Green Numbers."</p>
                    <div className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-500/20">
                        <h4 className="font-bold text-white mb-2">The Success Checklist</h4>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Keep Weekly Growth positive.</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Verify every 410 Gone link in Search Console.</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Spend 15 minutes manually editing every AI draft.</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Never let a High-Impression article sit with a boring title.</li>
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
