
import { Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export default function ThreatDashboard({ stats }) {
    const threatLevel = stats?.threatLevel || 'medium';

    const getLevelColor = (level) => {
        switch (level) {
            case 'critical': return 'bg-red-600';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-blue-500';
        }
    };

    const threatConfig = {
        critical: {
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            icon: <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse shadow-glow-critical" />,
            label: 'CRITICAL ALERT',
            desc: 'Extreme threats detected. Intelligence confirms active exploitation across multiple local sectors.'
        },
        high: {
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/30',
            icon: <Activity className="w-8 h-8 text-orange-500" />,
            label: 'ELEVATED RISK',
            desc: 'Significant cyberactivity detected targeting East African enterprise networks.'
        },
        medium: {
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            icon: <Shield className="w-8 h-8 text-blue-500" />,
            label: 'SECURE / MONITORING',
            desc: 'Active monitoring of signal intelligence in effect. All systems reporting within baseline.'
        },
        low: {
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
            label: 'NORMAL OPERATIONS',
            desc: 'No significant adversarial activity detected within the last triage cycle.'
        }
    };

    const config = threatConfig[threatLevel] || threatConfig['medium'];

    return (
        <div className="w-full bg-slate-950 border-b border-slate-800 shadow-2xl relative overflow-hidden">
            {/* HUD Scanline Effect */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

            <div className="max-w-7xl mx-auto px-4 py-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Status Indicator */}
                    <div className={`flex items-center space-x-6 px-6 py-4 rounded-xl border-2 backdrop-blur-md ${config.bg} ${config.border} w-full md:w-auto shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                        <div className="flex-shrink-0">{config.icon}</div>
                        <div>
                            <p className={`text-[10px] font-black tracking-[0.3em] ${config.color} uppercase opacity-70`}>Threat Index</p>
                            <h2 className={`text-2xl font-black tracking-tight ${config.color}`}>{config.label}</h2>
                        </div>
                    </div>

                    {/* Context & Ticker */}
                    <div className="flex-1 w-full md:ml-4">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            <span className="text-xs font-black text-blue-400 tracking-[0.2em] uppercase">Intelligence Feed Active</span>
                        </div>
                        <p className="text-slate-300 text-sm md:text-lg leading-relaxed font-medium">
                            {config.desc}
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="w-full md:w-auto">
                        <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400">
                            <Shield className="w-4 h-4 mr-2" />
                            Emergency Protocol
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
