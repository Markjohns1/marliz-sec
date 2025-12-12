
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
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
            label: 'CRITICAL ALERT',
            desc: 'Active widespread attacks detected. Immediate action required.'
        },
        high: {
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            icon: <Activity className="w-8 h-8 text-orange-600" />,
            label: 'ELEVATED RISK',
            desc: 'Multiple scams targeting local businesses reported.'
        },
        medium: {
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: <Shield className="w-8 h-8 text-yellow-600" />,
            label: 'MODERATE',
            desc: 'Standard security monitoring in effect. Stay vigilant.'
        },
        low: {
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: <CheckCircle className="w-8 h-8 text-green-600" />,
            label: 'NORMAL',
            desc: 'No major threats detected in the last 24 hours.'
        }
    };

    const config = threatConfig[threatLevel] || threatConfig['medium'];

    return (
        <div className="w-full bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                    {/* Status Indicator */}
                    <div className={`flex items-center space-x-4 px-6 py-3 rounded-xl border ${config.bg} ${config.border} w-full md:w-auto`}>
                        {config.icon}
                        <div>
                            <p className={`text-xs font-bold tracking-wider ${config.color} uppercase`}>Current Threat Level</p>
                            <h2 className={`text-xl font-black ${config.color}`}>{config.label}</h2>
                        </div>
                    </div>

                    {/* Context & Ticker */}
                    <div className="flex-1 w-full md:ml-6">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-sm font-bold text-slate-700">LIVE ANALYSIS</span>
                        </div>
                        <p className="text-slate-600 text-sm md:text-base">
                            {config.desc} <span className="text-slate-400 text-xs ml-2">Updated: Just now</span>
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="w-full md:w-auto mt-2 md:mt-0">
                        <button className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center shadow-lg">
                            <Shield className="w-4 h-4 mr-2" />
                            System Check
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
