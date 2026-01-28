import React, { useState } from 'react';
import { ChevronDown, Target, Clock, Users, BarChart3, Zap, PenLine, Shield, Edit3, Link, List, Table, Code, Palette, Globe, BookOpen } from 'lucide-react';

export default function AdminGuide() {
    const [openSection, setOpenSection] = useState(0);

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? -1 : index);
    };

    const sections = [
        {
            title: "1. The Anatomy of a 'Diamond' Dispatch (Structure)",
            icon: BookOpen,
            color: "text-blue-400",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        A premium report is never a "wall of text." It is a structured journey. Use these tools to guide the reader through complex intelligence.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                            <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Structural Hierarchy</h5>
                            <div className="space-y-3 font-mono text-[11px]">
                                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span className="text-slate-500">Break the Wall (H2)</span>
                                    <code className="text-blue-300">## Main Chapter</code>
                                </div>
                                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span className="text-slate-500">Technical Depth (H3)</span>
                                    <code className="text-blue-300">### Sub-Point</code>
                                </div>
                                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span className="text-slate-500">Analyst Verdict</span>
                                    <code className="text-blue-300">&gt; Your Opinion</code>
                                </div>
                                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span className="text-slate-500">Visual Break</span>
                                    <code className="text-blue-300">---</code>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">The "Evidence" Layer</h5>
                            <div className="space-y-3 font-mono text-[11px]">
                                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span className="text-slate-500">Cite Authority</span>
                                    <code className="text-emerald-300">[Source](URL)</code>
                                </div>
                                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span className="text-slate-500">Mitigation Steps</span>
                                    <code className="text-emerald-300">1. Action</code>
                                </div>
                                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span className="text-slate-500">IoC List</span>
                                    <code className="text-emerald-300">- Indicator</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Technical Power-Writing (Tables & Proof)",
            icon: Table,
            color: "text-emerald-400",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        For premium intelligence, **tables are mandatory**. They convey technical proof instantly. Copy and edit these blocks to build your data sections.
                    </p>

                    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                        <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Data Table (Copy/Paste)</span>
                        </div>
                        <div className="p-4 bg-black overflow-x-auto">
                            <code className="text-[11px] text-emerald-400 whitespace-pre leading-tight select-all">
                                {`| Indicator of Compromise | Value / Payload | Risk Level |
| :--- | :--- | :--- |
| C2 Server IP | 185.244.11.x | CRITICAL |
| Malicious Hash | 5e884898... | HIGH |
| Registry Key | HKLM\\Software\\... | MEDIUM |`}
                            </code>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase mb-2">Why we use this?</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                            "Google and Human Readers value structured data. A table transforms a fuzzy news report into a professional intelligence document."
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "3. Visual Authority (Strategic Highlighting)",
            icon: Palette,
            color: "text-amber-400",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        Use **Inline CSS** not for "design," but for **Strategic Emphasis**. Highlight the words you want the Chief of Security to see first.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                                <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3">1. Emergency Callouts</h5>
                                <p className="text-[10px] text-slate-500 mb-2">Makes a word pop like a red alarm.</p>
                                <code className="block bg-black p-3 rounded text-[11px] text-red-400 select-all border border-red-900/20">
                                    &lt;span style="color: #ef4444; font-weight: 900;"&gt;URGENT&lt;/span&gt;
                                </code>
                            </div>

                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                                <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">2. Strategic Markers</h5>
                                <p className="text-[10px] text-slate-500 mb-2">Draws the eye toward a specific fact.</p>
                                <code className="block bg-black p-3 rounded text-[11px] text-blue-300 select-all border border-blue-900/20">
                                    &lt;span style="background: rgba(59,130,246,0.15); padding: 2px 4px; border-radius: 4px;"&gt;KEY FACT&lt;/span&gt;
                                </code>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase mb-3">The Universal Styling Formula</h5>
                            <p className="text-[11px] text-slate-400 mb-4 font-serif italic leading-relaxed">
                                "You can change any property. Color, size, spacing, or weight. Wrap your content in the code below and experiment."
                            </p>
                            <code className="block bg-black p-4 rounded text-[12px] text-amber-500 border border-amber-900/20 font-bold">
                                &lt;span style="..."&gt;Text&lt;/span&gt;
                            </code>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-500">
                                <div>• color: #hex</div>
                                <div>• background: #hex</div>
                                <div>• font-weight: bold</div>
                                <div>• letter-spacing: 1px</div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "4. Editorial KPIs & Management",
            icon: Target,
            color: "text-purple-400",
            content: (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-purple-900/10 p-5 rounded-xl border border-purple-500/20 shadow-lg">
                            <h5 className="text-purple-400 font-bold text-xs mb-3 uppercase tracking-wider">The "Quality" Loop</h5>
                            <ul className="space-y-3 text-xs text-slate-300">
                                <li className="flex gap-3"><strong>1. AI Fetch:</strong> 1,800-word deep search.</li>
                                <li className="flex gap-3"><strong>2. Manual Polish:</strong> Inject structure & emphasis.</li>
                                <li className="flex gap-3"><strong>3. Proof of Authority:</strong> Add tables & links.</li>
                                <li className="flex gap-3"><strong>4. Publish:</strong> Verified for E-E-A-T.</li>
                            </ul>
                        </div>
                        <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-500/20 shadow-lg">
                            <h5 className="text-blue-400 font-bold text-xs mb-3 uppercase tracking-wider">Site Performance</h5>
                            <ul className="space-y-3 text-xs text-slate-300 font-medium">
                                <li className="flex items-center gap-3"><Clock className="w-4 h-4 text-blue-400" /> Audit "Page 2" content weekly.</li>
                                <li className="flex items-center gap-3"><Globe className="w-4 h-4 text-blue-400" /> Verify Indexing status monthly.</li>
                                <li className="flex items-center gap-3"><Shield className="w-4 h-4 text-blue-400" /> Monitor the Graveyard (410s).</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Editorial Masterclass</h2>
                <p className="text-slate-400">Transform raw data into premium Intelligence Dispatches.</p>
            </div>

            <div className="space-y-3 pb-12">
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
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-200 text-sm sm:text-base leading-none mb-1">{section.title}</span>
                                    <span className="text-[10px] text-slate-500 font-medium group-hover:text-slate-400 transition-colors">Tactical Command</span>
                                </div>
                            </div>
                            <ChevronDown
                                className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openSection === idx ? 'rotate-180 text-blue-400' : ''}`}
                            />
                        </button>

                        <div
                            className={`transition-all duration-300 ease-in-out ${openSection === idx ? 'max-h-[1500px] overflow-y-auto opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}
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
