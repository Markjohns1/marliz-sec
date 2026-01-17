import React from 'react';
import { Shield, ShieldOff, Zap, AlertCircle, Server, Globe } from 'lucide-react';

export default function SettingsTab({ systemStatus, handleToggleScheduler }) {

    // Future settings can simply be added to this array
    const settingsList = [
        {
            id: 'scheduler',
            label: 'Automated Intelligence',
            description: 'Autonomous background harvesting & AI processing engine.',
            icon: systemStatus?.scheduler_enabled ? Shield : ShieldOff,
            statusColor: systemStatus?.scheduler_enabled ? 'text-emerald-400' : 'text-red-400',
            iconBg: systemStatus?.scheduler_enabled ? 'bg-emerald-500/10' : 'bg-red-500/10',
            active: systemStatus?.scheduler_enabled,
            onToggle: handleToggleScheduler,
            lockedText: !systemStatus?.scheduler_enabled ? "Manual Override Active" : null
        },
        // Placeholders for future expansion (Visual Only)
        {
            id: 'cdn',
            label: 'CDN Performance Mode',
            description: 'Aggressive edge caching for static assets.',
            icon: Globe,
            statusColor: 'text-slate-500',
            iconBg: 'bg-slate-800/50',
            active: false,
            onToggle: () => { }, // No-op
            disabled: true
        },
        {
            id: 'api',
            label: 'API Rate Limiting',
            description: 'Strict protection against traffic spikes.',
            icon: Server,
            statusColor: 'text-slate-500',
            iconBg: 'bg-slate-800/50',
            active: true,
            onToggle: () => { }, // No-op
            disabled: true
        }
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-6 px-1">
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">System Configuration</h2>
                <p className="text-[10px] md:text-sm text-slate-400 font-medium italic">Manage protocols and operational overrides</p>
            </div>

            <div className="flex flex-col gap-3">
                {settingsList.map((setting) => (
                    <div
                        key={setting.id}
                        className={`group flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl transition-all ${setting.disabled ? 'opacity-50 grayscale' : 'hover:border-slate-700/80 hover:bg-slate-900/80'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${setting.iconBg} ${setting.statusColor}`}>
                                <setting.icon className="w-5 h-5" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm md:text-base font-bold text-white tracking-tight">
                                        {setting.label}
                                    </h3>
                                    {setting.lockedText && (
                                        <span className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/10 text-[9px] font-black text-red-500 uppercase tracking-wider">
                                            <AlertCircle className="w-2 h-2" />
                                            {setting.lockedText}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-normal md:leading-none mt-0.5 md:mt-1 truncate max-w-[200px] md:max-w-md">
                                    {setting.description}
                                </p>
                                {/* Mobile-only status text */}
                                {setting.lockedText && (
                                    <p className="md:hidden text-[9px] text-red-400 font-black uppercase mt-1">
                                        {setting.lockedText}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="pl-4">
                            <button
                                onClick={setting.onToggle}
                                disabled={setting.disabled}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none ${setting.active ? 'bg-emerald-600' : 'bg-slate-700'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.active ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 opacity-30">
                <Zap className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] font-mono text-slate-500 uppercase">Marliz Security Protocol v2.1</span>
            </div>
        </div>
    );
}
