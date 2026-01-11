
import React, { useState } from 'react';
import { getSeoHealth } from '../../services/api';
import {
    Activity,
    CheckCircle,
    AlertTriangle,
    Search,
    ShieldCheck,
    RefreshCw,
    XCircle,
    Server,
    Globe,
    Trash2
} from 'lucide-react';

export default function HealthTab() {
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);

    const runDiagnostic = async () => {
        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            // Add artificial delay for "Scanning" effect if it returns too fast
            const start = Date.now();
            const data = await getSeoHealth();
            const duration = Date.now() - start;

            if (duration < 1000) {
                await new Promise(r => setTimeout(r, 1000 - duration));
            }

            setReport(data);
        } catch (err) {
            setError(err.message || "Failed to contact SEO Health Service");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-emerald-400" />
                        System Health & SEO Validator
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Run a comprehensive diagnostic to verify site integrity and 410 protection status.
                    </p>
                </div>

                <button
                    onClick={runDiagnostic}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all ${isLoading
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 active:scale-95'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Running Diagnostic...
                        </>
                    ) : (
                        <>
                            <Search className="w-5 h-5" />
                            Run System Scan
                        </>
                    )}
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
                    <XCircle className="w-5 h-5" />
                    <span>Diagnostics Failed: {error}</span>
                </div>
            )}

            {/* Results Section */}
            {report && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Status Card */}
                    <div className={`col-span-1 p-6 rounded-2xl border ${report.summary.status === 'HEALTHY'
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-yellow-500/5 border-yellow-500/20'
                        }`}>
                        <div className="flex items-center gap-3 mb-4">
                            {report.summary.status === 'HEALTHY' ? (
                                <div className="p-3 bg-emerald-500/20 rounded-full">
                                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                </div>
                            ) : (
                                <div className="p-3 bg-yellow-500/20 rounded-full">
                                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-white">System Status</h3>
                                <p className={`text-sm font-bold ${report.summary.status === 'HEALTHY' ? 'text-emerald-400' : 'text-yellow-400'
                                    }`}>
                                    {report.summary.status === 'HEALTHY' ? 'ALL SYSTEMS OPERATIONAL' : 'ATTENTION REQUIRED'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                <span className="text-slate-400 text-sm flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> Live Articles
                                </span>
                                <span className="text-white font-mono font-bold">{report.summary.total_active}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                <span className="text-slate-400 text-sm flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Banned (410)
                                </span>
                                <span className="text-white font-mono font-bold">{report.summary.total_buried}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                <span className="text-slate-400 text-sm flex items-center gap-2">
                                    <Server className="w-4 h-4" /> Healthy Responses
                                </span>
                                <span className="text-emerald-400 font-mono font-bold">{report.summary.healthy_count}</span>
                            </div>
                        </div>
                    </div>

                    {/* Report Details */}
                    <div className="col-span-1 lg:col-span-2 space-y-4">
                        {report.summary.status === 'HEALTHY' ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-2xl text-center">
                                <CheckCircle className="w-16 h-16 text-emerald-500/20 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Zero Conflicts Found</h3>
                                <p className="text-slate-400 max-w-sm">
                                    Your system is perfectly synchronized.
                                    <br />
                                    <span className="text-emerald-400">
                                        {report.summary.total_active} Articles
                                    </span> are Live (200 OK) and
                                    <span className="text-indigo-400"> {report.summary.total_buried} Old Links</span>
                                    are correctly blocked (410 Gone).
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    conflicts Detectd ({report.summary.conflicts})
                                </h3>
                                {report.conflicts.map((conflict, idx) => (
                                    <div key={idx} className="p-4 bg-slate-800/50 border border-red-500/20 rounded-xl flex items-start gap-4">
                                        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-white font-bold text-sm">{conflict.title}</h4>
                                            <code className="text-xs text-slate-500 block mt-1 mb-2">{conflict.slug}</code>
                                            <p className="text-red-300 text-xs bg-red-500/10 px-2 py-1 rounded inline-block">
                                                {conflict.error}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
