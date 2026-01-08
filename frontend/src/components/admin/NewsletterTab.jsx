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
    Users,
    X
} from 'lucide-react';
import {
    getSubscribers,
    sendTestEmail,
    triggerNewsletterDigest,
    deleteSubscriber,
    toggleSubscriberPremium
} from '../../services/api';

export default function NewsletterTab({ selectedSubscribers, setSelectedSubscribers }) {
    const [page, setPage] = useState(1);
    const [testEmail, setTestEmail] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
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
                setStatusMsg({ type: 'success', text: 'Test Intel Sent! Check your inbox.' });
            } else {
                setStatusMsg({ type: 'error', text: res.message });
            }
        } catch (e) {
            setStatusMsg({ type: 'error', text: 'Connection lost' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleTriggerDigest = async () => {
        if (!confirm("🚨 BROADCAST TO ALL? This sends to every active subscriber.")) return;
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
        const articlesTab = document.querySelector('[data-tab="articles"]');
        if (articlesTab) {
            articlesTab.click();
            setStatusMsg({ type: 'info', text: 'Now select stories to send...' });
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
        if (!confirm(`Permanently delete subscriber ${email}?`)) return;
        try {
            await deleteSubscriber(id);
            refetch();
        } catch (e) {
            alert("Failed to delete subscriber");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Operations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {/* Stats Card */}
                <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Reach</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white">{data?.total || 0}</span>
                            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest leading-none">Subscribers</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                {/* Operations Bar */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full md:flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1 px-3">
                        <input
                            type="email"
                            placeholder="Send Test Intel To..."
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="bg-transparent border-none text-xs text-white outline-none flex-1 font-bold placeholder:text-slate-600"
                        />
                        <button
                            onClick={handleSendTest}
                            disabled={actionLoading}
                            className="p-2 hover:bg-white/5 rounded-lg text-primary-400 transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={handleTriggerDigest}
                            disabled={actionLoading}
                            className="flex-1 md:flex-none h-11 px-6 bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                            Quick Blast
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {statusMsg.text && (
                <div className={`mb-6 p-4 rounded-xl border animate-in slide-in-from-top-2 flex items-center gap-3 ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    statusMsg.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{statusMsg.text}</span>
                    <button onClick={() => setStatusMsg({ type: '', text: '' })} className="ml-auto p-1 hover:bg-white/10 rounded">
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}

            {/* Subscriber Card/Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-primary-400" />
                        <h3 className="font-black text-white uppercase tracking-widest text-xs">Intelligence Audience</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Filter emails..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-primary-500/50 transition-all font-bold w-full sm:w-48"
                            />
                        </div>
                        <button onClick={() => refetch()} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-500 hover:text-white transition-all">
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/80 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="col-span-1 text-center">Select</div>
                    <div className="col-span-5">Subscriber</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-center">Engagement</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-slate-800/50">
                    {isLoading ? (
                        <div className="px-6 py-12 text-center text-slate-500 font-bold italic">Scanning audience...</div>
                    ) : (data?.subscribers || []).filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase())).map((sub) => (
                        <div key={sub.id} className={`flex flex-col md:grid md:grid-cols-12 gap-3 p-4 md:px-6 md:py-4 hover:bg-white/5 transition-colors group ${selectedSubscribers.includes(sub.email) ? 'bg-emerald-500/5' : ''}`}>
                            <div className="md:col-span-1 flex items-center justify-between md:justify-center">
                                <button
                                    onClick={() => toggleSubSelection(sub.email)}
                                    className={`p-2 rounded-xl transition-all ${selectedSubscribers.includes(sub.email) ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-700 hover:text-slate-500'}`}
                                >
                                    {selectedSubscribers.includes(sub.email) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </button>
                                <div className="md:hidden">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${sub.unsubscribed_at ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                        {sub.unsubscribed_at ? 'Inactive' : 'Active'}
                                    </span>
                                </div>
                            </div>

                            <div className="md:col-span-5 flex items-center gap-3">
                                <div className="hidden sm:flex w-9 h-9 shrink-0 rounded-xl bg-slate-900 border border-slate-800 items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                    {sub.email[0]}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors truncate">{sub.email}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] text-slate-600 font-black uppercase tracking-tight">Intelligence Reader</span>
                                        {sub.is_premium && (
                                            <span className="text-[8px] font-black text-amber-500 uppercase px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded">PRO</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:flex md:col-span-2 items-center justify-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${sub.unsubscribed_at ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                    {sub.unsubscribed_at ? 'Inactive' : 'Active'}
                                </span>
                            </div>

                            <div className="md:col-span-2 flex items-center justify-between md:justify-center py-2 px-3 md:p-0 bg-slate-950/40 md:bg-transparent rounded-lg md:rounded-0">
                                <span className="md:hidden text-[8px] font-black text-slate-600 uppercase tracking-widest">Last Intel:</span>
                                {sub.last_email_sent ? (
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-primary-400 uppercase tracking-tighter">
                                        <MailCheck className="w-3 h-3" />
                                        {new Date(sub.last_email_sent).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </div>
                                ) : (
                                    <span className="text-[9px] text-slate-700 font-black uppercase italic">New Recruit</span>
                                )}
                            </div>

                            <div className="md:col-span-2 flex items-center justify-end gap-1 pt-2 md:pt-0 border-t md:border-0 border-slate-800/30">
                                <button
                                    onClick={() => handleTogglePremium(sub.id)}
                                    className={`p-2.5 rounded-xl transition-all ${sub.is_premium ? 'text-amber-500 bg-amber-500/10' : 'text-slate-600 hover:text-amber-500'}`}
                                >
                                    <Trophy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(sub.id, sub.email)}
                                    className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sub Pagination */}
            {data?.pages > 1 && (
                <div className="mt-4 px-6 py-4 bg-slate-900/30 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Page {page} of {data.pages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-black text-slate-400 uppercase tracking-widest disabled:opacity-30 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                        >
                            Prev
                        </button>
                        <button
                            disabled={page >= data.pages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-black text-slate-400 uppercase tracking-widest disabled:opacity-30 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Targeting Bar */}
            {selectedSubscribers.length > 0 && (
                <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300 w-[95%] max-w-2xl md:w-auto">
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <div className="flex items-center justify-between w-full md:w-auto">
                            <div className="flex flex-col">
                                <span className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">Targeting Mode</span>
                                <span className="text-white font-black text-xs md:text-sm">{selectedSubscribers.length} Recipients Selected</span>
                            </div>
                            <button onClick={() => setSelectedSubscribers([])} className="md:hidden p-2 text-slate-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="hidden md:block h-8 w-px bg-slate-800"></div>

                        <button
                            onClick={handleBatchTrigger}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 group"
                        >
                            <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Select Stories for These Recipients</span>
                        </button>

                        <button onClick={() => setSelectedSubscribers([])} className="hidden md:block p-2 text-slate-500 hover:text-white">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
