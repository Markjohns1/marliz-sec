import React from 'react';
import { Shield, ShieldOff, Zap, AlertCircle } from 'lucide-react';

export default function SettingsTab({ systemStatus, handleToggleScheduler }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight">Core Protocol Settings</h2>
                <p className="text-sm text-slate-400 font-medium italic">Configure automation and system behavior</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 transition-all hover:border-slate-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-5">
                            <div className={`p-4 rounded-2xl transition-all shadow-2xl ${systemStatus?.scheduler_enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {systemStatus?.scheduler_enabled ? <Shield className="w-8 h-8" /> : <ShieldOff className="w-8 h-8" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    Automated Intelligence
                                    {systemStatus?.scheduler_enabled ? (
                                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] rounded-full">LIVE</span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] rounded-full">PAUSED</span>
                                    )}
                                </h3>
                                <p className="text-sm text-slate-400 mt-1 max-w-md">
                                    Toggle the autonomous harvesting engine. When disabled, the machine stops all background news fetching,
                                    AI processing, and newsletter operations.
                                </p>

                                {!systemStatus?.scheduler_enabled && (
                                    <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-400/5 p-3 rounded-xl border border-red-400/10">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Manual Override Active: Overview controls are disabled.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-white/5 self-start md:self-center">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${systemStatus?.scheduler_enabled ? 'text-emerald-500' : 'text-slate-500'}`}>
                                {systemStatus?.scheduler_enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <button
                                onClick={handleToggleScheduler}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none ${systemStatus?.scheduler_enabled ? 'bg-emerald-600 shadow-[0_0_15px_rgba(5,150,105,0.4)]' : 'bg-slate-700'}`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${systemStatus?.scheduler_enabled ? 'translate-x-7' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-8 opacity-50">
                    <div className="flex items-start gap-4">
                        <Zap className="w-6 h-6 text-slate-600" />
                        <div>
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Extended Controls</h4>
                            <p className="text-xs text-slate-600 mt-2 italic font-mono">Advanced API rate-limiting and model selection protocols pending implementation...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
