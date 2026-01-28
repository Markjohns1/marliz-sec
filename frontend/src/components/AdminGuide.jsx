import React, { useState } from 'react';
import { ChevronDown, Target, Clock, Users, BarChart3, Zap, PenLine, Shield, Edit3, Link, List, Table, Code, Palette, Globe } from 'lucide-react';

export default function AdminGuide() {
    const [openSection, setOpenSection] = useState(0);

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? -1 : index);
    };

    const sections = [
        {
            title: "1. The Editorial Command Center (HTML & Inline CSS)",
            icon: Palette,
            color: "text-amber-400",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        Don't just use our presets. Use the raw power of <strong>Inline CSS</strong> to style any word, paragraph, or container exactly how you want.
                    </p>

                    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                        <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">The "Universal Tool" Formula</span>
                            <span className="text-[10px] font-mono text-emerald-500 font-bold">Safe for Editor</span>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="font-mono text-[13px] bg-black p-4 rounded border border-slate-800 text-blue-300 leading-relaxed">
                                &lt;span style="<span className="text-amber-400">property</span>: <span className="text-emerald-400">value</span>; <span className="text-amber-400">property</span>: <span className="text-emerald-400">value</span>;"&gt;YOUR CONTENT&lt;/span&gt;
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* CSS PROPERTIES LIST */}
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">CSS Properties You Can Use</h5>
                            <div className="space-y-2 font-mono text-[11px]">
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span className="text-amber-400">color</span>
                                    <span className="text-slate-500">#hex, rgb, or name</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span className="text-amber-400">background</span>
                                    <span className="text-slate-500">Color/Gradients</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span className="text-amber-400">font-weight</span>
                                    <span className="text-slate-500">bold, 900, normal</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span className="text-amber-400">letter-spacing</span>
                                    <span className="text-slate-500">2px, -1px, etc</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span className="text-amber-400">border</span>
                                    <span className="text-slate-500">1px solid #fff</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span className="text-amber-400">padding</span>
                                    <span className="text-slate-500">2px 8px</span>
                                </div>
                            </div>
                        </div>

                        {/* MASTER SAMPLES */}
                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Styles (Copy & Edit)</h5>

                            <div className="group">
                                <p className="text-[9px] text-slate-500 mb-1 uppercase font-bold">Cyber-Alert Red:</p>
                                <code className="block bg-black p-2 rounded text-[10px] text-red-400 border border-red-900/30 select-all">
                                    &lt;span style="color: #ff0000; font-weight: 900; letter-spacing: 2px;"&gt;DANGER&lt;/span&gt;
                                </code>
                            </div>

                            <div className="group">
                                <p className="text-[9px] text-slate-500 mb-1 uppercase font-bold">Ghost Highlight:</p>
                                <code className="block bg-black p-2 rounded text-[10px] text-blue-300 border border-blue-900/30 select-all">
                                    &lt;span style="background: rgba(0,0,0,0.5); border: 1px solid #333; padding: 2px 5px;"&gt;SECURE&lt;/span&gt;
                                </code>
                            </div>

                            <div className="group">
                                <p className="text-[9px] text-slate-500 mb-1 uppercase font-bold">Nuclear Yellow:</p>
                                <code className="block bg-black p-2 rounded text-[10px] text-amber-400 border border-amber-900/30 select-all">
                                    &lt;span style="color: #fbbf24; text-shadow: 0 0 10px #78350f;"&gt;HEATING&lt;/span&gt;
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Structuring the Intel (Markdown & Tables)",
            icon: Edit3,
            color: "text-blue-400",
            content: (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">Hiearchy & Layout</h5>
                            <div className="space-y-2 font-mono text-[11px]">
                                <div className="bg-slate-900 p-2 rounded flex justify-between border border-slate-800"><span className="text-slate-500">Main Section</span><code className="text-blue-300">## Title</code></div>
                                <div className="bg-slate-900 p-2 rounded flex justify-between border border-slate-800"><span className="text-slate-500">Sub Section</span><code className="text-blue-300">### Title</code></div>
                                <div className="bg-slate-900 p-2 rounded flex justify-between border border-slate-800"><span className="text-slate-500">Expert Note</span><code className="text-blue-300">&gt; Text</code></div>
                                <div className="bg-slate-900 p-2 rounded flex justify-between border border-slate-800"><span className="text-slate-500">Bullet Points</span><code className="text-emerald-300">- Item</code></div>
                                <div className="bg-slate-900 p-2 rounded flex justify-between border border-slate-800"><span className="text-slate-500">Citation Link</span><code className="text-emerald-300">[A](URL)</code></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">Data Proof (Tables & Code)</h5>
                            <div className="group">
                                <p className="text-[9px] text-slate-500 mb-1 uppercase font-bold">Technical Data Table (Copy/Paste):</p>
                                <div className="bg-black p-3 rounded border border-emerald-900/20">
                                    <code className="block text-[10px] text-emerald-400 whitespace-pre select-all leading-tight">
                                        {`| Indicator | Value | Type |
| :--- | :--- | :--- |
| Trojan-X | 192.168.1.1 | IPv4 |
| Payload | file.exe | SHA256 |`}
                                    </code>
                                </div>
                                <p className="text-[8px] text-slate-600 mt-1 italic">Use this for IoCs, technical comparisons, or server specs.</p>
                            </div>

                            <div className="group">
                                <p className="text-[9px] text-slate-500 mb-1 uppercase font-bold">Technical Evidence Block:</p>
                                <div className="bg-black p-3 rounded border border-blue-900/20">
                                    <code className="block text-[10px] text-blue-300 whitespace-pre select-all leading-tight">
                                        {`\`\`\`json
{
  "status": "compromised",
  "threat_level": "critical"
}
\`\`\``}
                                    </code>
                                </div>
                                <p className="text-[8px] text-slate-600 mt-1 italic">Use triple backticks to wrap logs or JSON data.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Operational Workflow & KPIs",
            icon: Target,
            color: "text-purple-400",
            content: (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-purple-900/10 p-5 rounded-xl border border-purple-500/20">
                            <h5 className="text-purple-400 font-bold text-xs mb-3 uppercase tracking-wider">Editor Checklist</h5>
                            <ul className="space-y-3 text-xs text-slate-300">
                                <li className="flex gap-3"><strong>1.</strong> Review AI Draft (1,800 words goal).</li>
                                <li className="flex gap-3"><strong>2.</strong> Add 1-2 unique Analyst Verdicts using <code>&gt;</code>.</li>
                                <li className="flex gap-3"><strong>3.</strong> Style Critical Keywords using <code>&lt;span style="..."&gt;</code>.</li>
                                <li className="flex gap-3"><strong>4.</strong> Clean the Article Slug (Keywords only).</li>
                            </ul>
                        </div>
                        <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-500/20">
                            <h5 className="text-blue-400 font-bold text-xs mb-3 uppercase tracking-wider">SEO Hard-Stops</h5>
                            <ul className="space-y-3 text-xs text-slate-300">
                                <li className="flex items-center gap-2"><Globe className="w-3 h-3" /> Check for deleted logs in Search Console.</li>
                                <li className="flex items-center gap-3"><strong>Weekly:</strong> Audit position (Pos) 4-12 articles.</li>
                                <li className="flex items-center gap-3"><strong>Monthly:</strong> Verify all 410 Gone responses.</li>
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
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Editor's Tactical Manual</h2>
                <p className="text-slate-400">Master the structure, styling, and strategy of MarlizIntel.</p>
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
