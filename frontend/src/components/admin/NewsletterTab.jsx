import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Mail,
    UserPlus,
    Send,
    Trophy,
    ShieldCheck,
    Clock,
    MailCheck,
    Search,
    RefreshCw,
    ExternalLink,
    AlertCircle,
    Zap
} from 'lucide-react';
import { getSubscribers, sendTestEmail, triggerNewsletterDigest } from '../../services/api';

export default function NewsletterTab() {
    const [page, setPage] = useState(1);
    const [testEmail, setTestEmail] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['admin-subscribers', page],
        queryFn: () => getSubscribers(page),
        refetchOnWindowFocus: false,
    });

    const handleSendTest = async () => {
        if (!testEmail) return alert("Enter email first");
        setActionLoading(true);
        try {
            const res = await sendTestEmail(testEmail);
            if (res.status === 'success') alert("Test Email Sent!");
            else alert("Error: " + res.message);
        } catch (e) {
            alert("Failed to send test");
        } finally {
            setActionLoading(false);
        }
    };

    const handleTriggerDigest = async () => {
        if (!confirm("Are you sure you want to send the digest to ALL current active subscribers?")) return;
        setActionLoading(true);
        try {
            const res = await triggerNewsletterDigest();
            if (res.status === 'success') alert("Digest Sent to All!");
            else alert("Error: " + res.message);
        } catch (e) {
            alert("Failed to trigger digest");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* High Density Intel Bar */}
            <div className="flex flex-col lg:flex-row items-stretch gap-4 mb-8">
                {/* Metrics Chip */}
                <div className="flex-1 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Reach</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">{data?.total || 0}</span>
                                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Live Subs</span>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-slate-800"></div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Health Score</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-white">98%</span>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`w-1 h-3 rounded-full ${i < 5 ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operations Bar */}
                <div className="lg:w-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                    {/* Test Control */}
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1 px-3">
                        <input
                            type="email"
                            placeholder="Test Email..."
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="bg-transparent border-none text-[11px] text-white outline-none w-32 font-bold placeholder:text-slate-600"
                        />
                        <button
                            onClick={handleSendTest}
                            disabled={actionLoading}
                            className="p-1.5 hover:bg-white/5 rounded-lg text-primary-400 transition-all"
                            title="Send Test"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

                    {/* Trigger Control */}
                    <button
                        onClick={handleTriggerDigest}
                        disabled={actionLoading}
                        className="h-10 px-6 bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-primary-500/20 active:scale-95 flex items-center gap-2"
                    >
                        {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        Blast Digest
                    </button>
                </div>
            </div>

            {/* Subscriber List */}
            <div className="card overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MailCheck className="w-5 h-5 text-blue-400" />
                        <h3 className="font-bold text-white tracking-tight">Intelligence Subscribers</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => refetch()}
                            className="p-2 text-slate-500 hover:bg-white/5 rounded-xl transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Subscriber Identity</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Engagement</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-12 text-center text-slate-500 font-bold italic">Scanning audience...</td>
                                </tr>
                            ) : data?.subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-12 text-center text-slate-500 font-bold italic">No subscribers found in current selection.</td>
                                </tr>
                            ) : data?.subscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-300">
                                                {sub.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-primary-400 transition-colors">{sub.email}</div>
                                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ref: Organic Search</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1.5">
                                            {sub.unsubscribed_at ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-500/20 w-fit">
                                                    Inactive
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 w-fit">
                                                    Active
                                                </span>
                                            )}
                                            {sub.is_premium && (
                                                <span className="inline-flex items-center gap-1 px-1.5 text-[8px] font-black text-amber-500 uppercase bg-amber-500/10 rounded border border-amber-500/20 w-fit">
                                                    <Trophy className="w-2.5 h-2.5" />
                                                    Premium
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 w-fit">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Trusted Host</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <div className="text-xs font-bold text-slate-300">
                                                {new Date(sub.subscribed_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-[9px] text-slate-500 font-bold uppercase">
                                                {new Date(sub.subscribed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data?.pages > 1 && (
                    <div className="px-8 py-6 bg-slate-950/30 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Page {page} of {data.pages}</span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest disabled:opacity-30 hover:bg-slate-800 hover:text-white transition-all"
                            >
                                Prev
                            </button>
                            <button
                                disabled={page >= data.pages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest disabled:opacity-30 hover:bg-slate-800 hover:text-white transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
