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
    Zap,
    Trash2,
    Star,
    CheckSquare,
    Square,
    UserCheck,
    Users
} from 'lucide-react';
import {
    getSubscribers,
    sendTestEmail,
    triggerNewsletterDigest,
    deleteSubscriber,
    toggleSubscriberPremium
} from '../../services/api';

export default function NewsletterTab() {
    const [page, setPage] = useState(1);
    const [testEmail, setTestEmail] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const [selectedSubscribers, setSelectedSubscribers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['admin-subscribers', page],
        queryFn: () => getSubscribers(page),
        refetchOnWindowFocus: false,
    });

    const handleSendTest = async () => {
        if (!testEmail) {
            setStatusMsg({ type: 'error', text: 'Enter email first' });
            return;
        }
        setActionLoading(true);
        setStatusMsg({ type: 'info', text: 'Sending test intelligence...' });
        try {
            const res = await sendTestEmail(testEmail);
            if (res.status === 'success') {
                setStatusMsg({ type: 'success', text: 'Test Intel Sent! Check your inbox/spam.' });
            } else {
                setStatusMsg({ type: 'error', text: res.message });
            }
        } catch (e) {
            setStatusMsg({ type: 'error', text: 'Critical Error: Connection lost' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleTriggerDigest = async () => {
        if (!confirm("🚨 WARNING: You are about to broadcast to the ENTIRE active audience. Continue?")) return;
        setActionLoading(true);
        setStatusMsg({ type: 'info', text: 'Broadcasting to all globally...' });
        try {
            const res = await triggerNewsletterDigest();
            if (res.status === 'success') {
                setStatusMsg({ type: 'success', text: res.message });
                refetch();
            } else {
                setStatusMsg({ type: 'error', text: res.message });
            }
        } catch (e) {
            setStatusMsg({ type: 'error', text: 'Failed to trigger broadcast' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleBatchTrigger = async () => {
        if (selectedSubscribers.length === 0) return;
        if (!confirm(`Send intelligence to ${selectedSubscribers.length} selected subscribers ONLY?`)) return;

        setActionLoading(true);
        setStatusMsg({ type: 'info', text: 'Targeted broadcast in progress...' });
        try {
            const res = await triggerNewsletterDigest(null, null, selectedSubscribers);
            if (res.status === 'success') {
                setStatusMsg({ type: 'success', text: `Targeted Intel Delivered to ${selectedSubscribers.length} recipients` });
                setSelectedSubscribers([]);
                refetch();
            } else {
                setStatusMsg({ type: 'error', text: res.message });
            }
        } catch (e) {
            setStatusMsg({ type: 'error', text: 'Targeted send failed' });
        } finally {
            setActionLoading(false);
        }
    };

    const toggleSubSelection = (email) => {
        if (selectedSubscribers.includes(email)) {
            setSelectedSubscribers(prev => prev.filter(e => e !== email));
        } else {
            setSelectedSubscribers(prev => [...prev, email]);
        }
    };

    const handleTogglePremium = async (id) => {
        try {
            await toggleSubscriberPremium(id);
            refetch();
        } catch (e) {
            alert("Failed to toggle status");
        }
    };

    const handleDelete = async (id, email) => {
        if (!confirm(`Permanently delete subscriber ${email}? This cannot be undone.`)) return;
        try {
            await deleteSubscriber(id);
            refetch();
        } catch (e) {
            alert("Failed to delete subscriber");
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

                    {/* Trigger Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                // Find the Articles tab button and click it
                                const articlesTab = document.querySelector('[data-tab="articles"]');
                                if (articlesTab) articlesTab.click();
                            }}
                            className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 border border-slate-700"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Select Manually
                        </button>

                        <button
                            onClick={handleTriggerDigest}
                            disabled={actionLoading}
                            className="h-10 px-6 bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-primary-500/20 active:scale-95 flex items-center gap-2"
                            title="Auto-send top 5 articles from the last 7 days"
                        >
                            {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                            Quick Blast
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Feedback Bar */}
            {statusMsg.text && (
                <div className={`mb-4 p-4 rounded-xl border animate-in slide-in-from-top-2 flex items-center gap-3 ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    statusMsg.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>
                    {statusMsg.type === 'success' ? <MailCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="text-[11px] font-bold uppercase tracking-wider">{statusMsg.text}</span>
                    <button onClick={() => setStatusMsg({ type: '', text: '' })} className="ml-auto opacity-50 hover:opacity-100 text-[10px] font-black">CLOSE</button>
                </div>
            )}

            {/* Subscriber List */}
            <div className="card overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MailCheck className="w-5 h-5 text-blue-400" />
                        <h3 className="font-bold text-white tracking-tight">Intelligence Subscribers</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Filter audience..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-primary-500/50 transition-all font-bold w-48 sm:w-64"
                            />
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-slate-800"
                            title="Refresh List"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-slate-800">
                                <th className="px-8 py-4 w-12 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-slate-800" />
                                    </div>
                                </th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Subscriber Identity</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Engagement</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Joined</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-12 text-center text-slate-500 font-bold italic">Scanning audience...</td>
                                </tr>
                            ) : data?.subscribers.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase())).map((sub) => (
                                <tr key={sub.id} className={`hover:bg-white/5 transition-colors group ${selectedSubscribers.includes(sub.email) ? 'bg-primary-500/5' : ''}`}>
                                    <td className="px-8 py-5">
                                        <button
                                            onClick={() => toggleSubSelection(sub.email)}
                                            className={`p-2 rounded-lg transition-all ${selectedSubscribers.includes(sub.email) ? 'text-primary-400' : 'text-slate-700 hover:text-slate-500'}`}
                                        >
                                            {selectedSubscribers.includes(sub.email) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                        </button>
                                    </td>
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
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 w-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Trusted Host</span>
                                            </div>
                                            {sub.last_email_sent ? (
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400 px-1 uppercase tracking-tighter">
                                                    <MailCheck className="w-3 h-3" />
                                                    Last Alert: {new Date(sub.last_email_sent).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-600 px-1 uppercase tracking-tighter italic">
                                                    No Alerts Sent
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleTogglePremium(sub.id)}
                                                className={`p-2 rounded-xl transition-all border ${sub.is_premium ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-slate-500 hover:bg-slate-800 border-transparent'}`}
                                                title={sub.is_premium ? "Remove Premium" : "Grant Premium"}
                                            >
                                                <Trophy className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sub.id, sub.email)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                                title="Delete Subscriber"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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

            {/* Floating Selection Bar */}
            {selectedSubscribers.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] px-6 py-4 rounded-3xl flex items-center gap-8 min-w-[320px]">
                        <div className="flex flex-col">
                            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Targeting Mode</div>
                            <div className="text-white font-black text-sm">{selectedSubscribers.length} Recipient{selectedSubscribers.length > 1 ? 's' : ''} Selected</div>
                        </div>

                        <div className="h-8 w-px bg-slate-800"></div>

                        <button
                            onClick={handleBatchTrigger}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 group"
                        >
                            {actionLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <UserCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Send to Selected
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setSelectedSubscribers([])}
                            className="p-2 text-slate-500 hover:text-white transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
