import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AdminGuide from '../components/AdminGuide';
import { getDashboardStats, triggerNewsFetch, triggerSimplify, logout, updateArticle, getArticleStats } from '../services/api';
import { Helmet } from 'react-helmet-async';
import {
    LayoutDashboard,
    LogOut,
    RefreshCw,
    Zap,
    FileText,
    CheckCircle,
    Clock,
    Eye,
    TrendingUp,
    Calendar,
    BarChart3,
    Flame,
    FolderOpen,
    ArrowUpRight,
    ArrowDownRight,
    Shield,
    ShieldOff,
    Edit3,
    Search,
    Filter,
    X,
    Save,
    ExternalLink,
    AlertCircle,
    Settings as SettingsIcon,
    Globe,
    BookOpen,
    Share2,
    Copy,
    Share
} from 'lucide-react';
import { getAdminArticles, publishArticle } from '../services/api';


// Helper Components
function StatCard({ title, value, icon: Icon, color, loading, subtitle }) {
    return (
        <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-xl ${color}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
            </div>
            <h3 className="text-slate-400 text-xs sm:text-sm font-medium mb-1 uppercase tracking-widest">{title}</h3>
            <div className="text-2xl sm:text-3xl font-black text-white">
                {loading ? '...' : (value?.toLocaleString() || 0)}
            </div>
            {subtitle && <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{subtitle}</p>}
        </div>
    );
}

function GrowthBadge({ value }) {
    const isPositive = value >= 0;
    return (
        <div className={`flex items-center gap-1 text-lg sm:text-2xl font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            {Math.abs(value).toFixed(1)}%
        </div>
    );
}

function QuickEditModal({ article, onClose, onSave }) {
    const [draftTitle, setDraftTitle] = useState(article.draft_title || article.title);
    const [draftMeta, setDraftMeta] = useState(article.draft_meta_description || article.meta_description || '');
    const [draftKeywords, setDraftKeywords] = useState(article.draft_keywords || article.keywords || '');
    const [saving, setSaving] = useState(false);

    const handleAction = async (isPublish) => {
        setSaving(true);
        try {
            await onSave(article.id, {
                draft_title: draftTitle,
                draft_meta_description: draftMeta,
                draft_keywords: draftKeywords,
                publish_now: isPublish,
                edited_by: 'admin'
            });
            if (isPublish) {
                alert('Published! Changes should be live in a few minutes.');
            } else {
                alert('Draft saved successfully!');
            }
            onClose();
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-primary-400" />
                        <h3 className="font-bold text-white">Quick SEO Edit</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">SEO Title (Target 60 chars)</label>
                        <input
                            type="text"
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-white"
                            placeholder="Enter catchy SEO title..."
                        />
                        <div className="mt-1 text-[10px] text-right text-slate-500 font-bold">{draftTitle.length}/60</div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Meta Description (Target 160 chars)</label>
                        <textarea
                            value={draftMeta}
                            onChange={(e) => setDraftMeta(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm text-white"
                            placeholder="Hook + Details + Call to Action..."
                        />
                        <div className="mt-1 text-[10px] text-right text-slate-500 font-bold">{draftMeta.length}/160</div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Keywords (Comma separated)</label>
                        <input
                            type="text"
                            value={draftKeywords}
                            onChange={(e) => setDraftKeywords(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm text-white"
                            placeholder="keyword1, keyword2, keyword3..."
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${article.has_draft ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {article.has_draft ? 'Has unpublished changes' : 'Live version synced'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAction(false)}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors disabled:opacity-50"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={() => handleAction(true)}
                            disabled={saving}
                            className="btn-primary text-sm flex items-center gap-2 px-6 py-2"
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Save & Publish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShareModal({ article, onClose }) {
    const [copied, setCopied] = useState(null);
    const domain = window.location.origin;
    const articleUrl = `${domain}/article/${article.slug}`;

    const channels = [
        { name: 'WhatsApp', icon: '📲', ref: 'wa', color: 'text-emerald-400' },
        { name: 'Facebook', icon: '👤', ref: 'fb', color: 'text-blue-400' },
        { name: 'LinkedIn', icon: '💼', ref: 'li', color: 'text-sky-400' },
        { name: 'Discord', icon: '💬', ref: 'dc', color: 'text-indigo-400' },
        { name: 'X (Twitter)', icon: '𝕏', ref: 'x', color: 'text-white' },
        { name: 'Direct/UTM', icon: '🔗', ref: 'direct', color: 'text-slate-400' },
    ];

    const copyToClipboard = (ref) => {
        const trackedUrl = `${articleUrl}?ref=${ref}`;
        navigator.clipboard.writeText(trackedUrl);
        setCopied(ref);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h3 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-blue-400" />
                        Intelligence Share Hub
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Select tracked channel:</p>
                    <div className="grid grid-cols-1 gap-2">
                        {channels.map((ch) => (
                            <button
                                key={ch.ref}
                                onClick={() => copyToClipboard(ch.ref)}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{ch.icon}</span>
                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white">{ch.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {copied === ch.ref ? (
                                        <span className="text-[10px] font-black text-emerald-500 uppercase">Copied!</span>
                                    ) : (
                                        <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-slate-900/50 border-t border-slate-800 text-center">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Tracks every click back to this dashboard</p>
                </div>
            </div>
        </div>
    );
}

function SourceStatsModal({ article, onClose }) {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getArticleStats(article.id);
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [article.id]);

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h3 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                        Intel Breakdown: {article.title.substring(0, 20)}...
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="py-12 text-center text-slate-500 font-bold italic text-xs animate-pulse">Analyzing traffic patterns...</div>
                    ) : stats.length > 0 ? (
                        <div className="space-y-3">
                            {stats.map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-xs font-bold text-slate-300">{s.platform}</span>
                                    </div>
                                    <span className="text-sm font-black text-white px-2 py-0.5 bg-slate-900 rounded-lg border border-slate-800">{s.hits} Hits</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">No specific source data recorded yet.</p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-900/50 border-t border-slate-800 text-center">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Granular Traffic Recognition</p>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, articles, categories, settings
    const [editingArticle, setEditingArticle] = useState(null);
    const [sharingArticle, setSharingArticle] = useState(null);
    const [viewingStats, setViewingStats] = useState(null);

    // Filter States for Articles Tab
    const [artSearch, setArtSearch] = useState('');
    const [artSort, setArtSort] = useState('date');
    const [artPage, setArtPage] = useState(1);

    // Fetch Stats
    const { data: stats, isLoading, refetch } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: getDashboardStats,
        retry: false,
        refetchInterval: actionLoading ? 3000 : 30000, // Sync every 3s during active processing
        onError: () => {
            logout();
            navigate('/console/login');
        }
    });

    // Fetch Admin Articles List
    const { data: articleData, isLoading: artLoading, refetch: artRefetch } = useQuery({
        queryKey: ['admin-articles', artPage, artSort, artSearch],
        queryFn: () => getAdminArticles({ page: artPage, sort_by: artSort, search: artSearch }),
        enabled: activeTab === 'articles'
    });

    const handleLogout = () => {
        logout();
        navigate('/console/login');
    };

    const handleToggleProtection = async (articleId, currentStatus) => {
        try {
            await updateArticle(articleId, {
                protected_from_deletion: !currentStatus,
                edited_by: 'admin'
            });
            await refetch();
            if (activeTab === 'articles') await artRefetch();
            setMessage({ type: 'success', text: `Success: Article protection ${!currentStatus ? 'enabled' : 'disabled'}.` });
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        }
    };

    const handleSaveEdit = async (id, updates) => {
        await updateArticle(id, updates);
        await refetch();
        await artRefetch();
    };

    const handleAction = async (actionFn, name) => {
        setActionLoading(name);
        setMessage(null);

        // Immediate UI refresh pulse
        const progressInterval = setInterval(() => refetch(), 2000);

        try {
            const result = await actionFn();
            if (result.processed !== undefined) {
                setMessage({ type: 'success', text: `✓ Processed ${result.processed} articles.` });
            } else if (result.total_new !== undefined) {
                setMessage({ type: 'success', text: `✓ Fetched ${result.total_new} new articles.` });
            } else {
                setMessage({ type: 'success', text: `✓ ${name} completed.` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            clearInterval(progressInterval);
            setActionLoading(null);
            await refetch();
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-20 text-slate-100">
            <Helmet>
                <title>Admin Dashboard | Marliz Security</title>
            </Helmet>

            {/* Enhanced Admin Navigation Shell - Fixed Top */}
            <div className="fixed top-0 left-0 right-0 z-50">
                {/* Primary Admin Top Bar */}
                <div className="bg-slate-900 border-b border-white/5 text-white px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                <span>Marliz<span className="text-red-500">Intel</span></span>
                                <span className="h-4 w-px bg-slate-800 mx-1"></span>
                                <span className="text-xs sm:text-sm font-black text-blue-400 uppercase tracking-widest">Admin</span>
                            </h1>
                            <div className="hidden min-[450px]:flex items-center gap-1.5 -mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate max-w-[150px] sm:max-w-none">Digital Intelligence Dashboard</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 group px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-all border border-slate-800"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-slate-500 font-bold leading-none">SIGN OUT</p>
                                <p className="text-xs font-bold text-slate-300 truncate max-w-[80px]">Admin</p>
                            </div>
                            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Sticky Secondary Navigation (Tabs) */}
                <div className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
                    <div className="container mx-auto max-w-6xl px-4 flex items-center gap-1 h-16">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'articles', label: 'Articles', icon: Edit3 },
                            { id: 'categories', label: 'Insights', icon: FolderOpen },
                            { id: 'settings', label: 'Settings', icon: SettingsIcon },
                            { id: 'guide', label: 'Playbook', icon: BookOpen },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 h-full text-xs sm:text-sm font-bold opacity-90 transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-red-500 text-red-500 bg-red-500/5'
                                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-red-500' : 'text-slate-500'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content - Added padding-top to account for fixed header */}
            <div className="container mx-auto max-w-6xl px-4 pt-36 pb-24">

                {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-500">
                        {/* Welcome */}
                        <div className="mb-6 sm:mb-8">
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">System Overview</h2>
                            <p className="text-sm sm:text-base text-slate-400 font-medium italic">Integrated Intelligence Dashboard</p>
                        </div>

                        {/* Primary Wisdom Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                            <StatCard
                                title="Intelligence Library"
                                value={stats?.total_articles}
                                icon={FileText}
                                color="bg-blue-600"
                                loading={isLoading}
                                subtitle="Total reports published"
                            />
                            <StatCard
                                title="Public Impact"
                                value={stats?.total_views}
                                icon={Globe}
                                color="bg-purple-600"
                                loading={isLoading}
                                subtitle="Total global readership"
                            />
                            <StatCard
                                title="Fresh Intel (24h)"
                                value={stats?.articles_today}
                                icon={Zap}
                                color="bg-yellow-600"
                                loading={isLoading}
                                subtitle="New reports today"
                            />
                            <StatCard
                                title="Reader Interest"
                                value={stats?.avg_views}
                                icon={BarChart3}
                                color="bg-emerald-600"
                                loading={isLoading}
                                subtitle="Avg views per report"
                            />
                        </div>

                        {/* Secondary Wisdom Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="card p-6 flex flex-col justify-between border-l-4 border-l-blue-500">
                                <div>
                                    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Publishing Streak</h3>
                                    <div className="flex items-center gap-2">
                                        <GrowthBadge value={stats?.growth_pct || 0} />
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Activity vs last week</p>
                                </div>
                            </div>

                            <div className="card p-6 flex flex-col justify-between border-l-4 border-l-purple-500">
                                <div>
                                    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Google Standing</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-white">{stats?.global_avg_position || '0.0'}</span>
                                        <span className="text-xs text-slate-500 font-bold">AVG POS</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Rank across search engines</p>
                                </div>
                            </div>

                            <div className="card p-6 flex flex-col justify-between border-l-4 border-l-orange-500">
                                <div>
                                    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Top Category</h3>
                                    <div className="flex items-center gap-2">
                                        <Flame className="w-5 h-5 text-orange-500" />
                                        <span className="text-lg font-black text-white uppercase truncate">{stats?.top_category || 'N/A'}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Most engaging topic</p>
                                </div>
                            </div>
                        </div>

                        {/* Traffic Source Intelligence Table */}
                        <div className="mb-8">
                            <h3 className="font-black text-white uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                                <Search className="w-3.5 h-3.5 text-blue-400" />
                                Traffic Origins (Context-Aware Recognition)
                            </h3>
                            <div className="card overflow-hidden border-slate-800 bg-slate-900/20">
                                <div className="grid grid-cols-2 bg-slate-900/60 p-3 border-b border-slate-800">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform / Source</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Impact (Hits)</div>
                                </div>
                                <div className="divide-y divide-slate-800/50">
                                    {stats?.traffic_sources && stats.traffic_sources.length > 0 ? (
                                        stats.traffic_sources.map((source, idx) => (
                                            <div key={idx} className="grid grid-cols-2 p-3 hover:bg-white/[0.02] transition-colors items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                    <span className="text-xs font-bold text-slate-200">{source.platform}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-black text-white px-2 py-0.5 bg-slate-950 rounded-lg border border-slate-800">
                                                        {source.hits.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Waiting for incoming intelligence signals...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2 card p-6">
                            <h3 className="font-black text-white uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                System Controls
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleAction(triggerNewsFetch, 'News Fetch')}
                                    disabled={actionLoading}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-primary-500 transition-all group"
                                >
                                    <div className="p-2.5 bg-primary-900/40 rounded-xl text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                        <RefreshCw className={`w-5 h-5 ${actionLoading === 'News Fetch' ? 'animate-spin' : ''}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-white uppercase tracking-tight text-sm">Force Fetch</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase">Sync News Articles</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleAction(triggerSimplify, 'Intel Processing')}
                                    disabled={actionLoading}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500 transition-all group"
                                >
                                    <div className="p-2.5 bg-purple-900/40 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                        <Zap className={`w-5 h-5 ${actionLoading === 'Intel Processing' ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-white uppercase tracking-tight text-sm">Intelligence Processor</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase">Generate Human-Friendly Briefings</div>
                                    </div>
                                </button>
                            </div>

                            {actionLoading && (
                                <div className="mt-4 p-4 rounded-2xl bg-blue-900/20 border border-blue-500/30 flex items-center justify-between animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="flex space-x-1">
                                            <div className="w-1.5 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live Intelligence Pulse</p>
                                            <p className="text-xs font-bold text-white">System is processing live data. Dashboard is auto-syncing every 2s...</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">Active</span>
                                </div>
                            )}

                            {message && (
                                <div className={`mt-4 p-3 rounded-xl text-xs font-black uppercase tracking-widest ${message.type === 'error' ? 'bg-red-950/50 text-red-500 border border-red-900/50' : 'bg-emerald-950/50 text-emerald-500 border border-emerald-900/50'}`}>
                                    {message.text}
                                </div>
                            )}
                        </div>

                        {/* Trending Articles */}
                        <div className="card p-6 mb-8">
                            <h3 className="font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                                <Flame className="w-4 h-4 text-orange-500" />
                                Hot Topics
                            </h3>
                            <div className="space-y-2">
                                {stats?.trending_articles?.map((article, idx) => (
                                    <div key={article.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group">
                                        <div className="text-xl font-black text-slate-800 group-hover:text-primary-500/50 transition-colors w-8">0{idx + 1}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors truncate">{article.title}</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">{article.views} views</div>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <button
                                                onClick={() => setViewingStats(article)}
                                                className="p-1.5 sm:p-2 rounded-xl bg-slate-950 text-emerald-500 border border-slate-800 hover:border-emerald-500/30 transition-all"
                                                title="Intel Breakdown"
                                            >
                                                <BarChart3 className="w-3.5 h-3.5 sm:w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setSharingArticle(article)}
                                                className="p-1.5 sm:p-2 rounded-xl bg-slate-950 text-blue-500 border border-slate-800 hover:border-blue-500/30 transition-all"
                                                title="Tracked Share"
                                            >
                                                <Share2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleProtection(article.id, article.protected)}
                                                className={`p-2 rounded-xl transition-all ${article.protected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-500 border border-slate-800 hover:border-slate-600'}`}
                                            >
                                                {article.protected ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'articles' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h2 className="text-2xl font-black text-white tracking-tight">Article Management</h2>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Quick search..."
                                        value={artSearch}
                                        onChange={(e) => { setArtSearch(e.target.value); setArtPage(1); }}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all text-white"
                                    />
                                </div>
                                <select
                                    value={artSort}
                                    onChange={(e) => setArtSort(e.target.value)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer hover:bg-slate-800"
                                >
                                    <option value="date">Most Recent</option>
                                    <option value="views">High Traffic</option>
                                    <option value="impressions">SEO Impressions</option>
                                    <option value="position">GSC Visibility</option>
                                </select>
                            </div>
                        </div>

                        {/* Article Table */}
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-900/50 border-b border-slate-800">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Intelligence Report</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Metrics</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {artLoading ? (
                                            <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-bold italic">Scanning database...</td></tr>
                                        ) : articleData?.articles.map((article) => (
                                            <tr key={article.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 max-w-md">
                                                    <div className="font-bold text-slate-200 group-hover:text-primary-400 transition-colors line-clamp-1">{article.title}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded uppercase tracking-tighter border border-slate-700">
                                                            {article.category?.name || 'General'}
                                                        </span>
                                                        <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(article.published_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-6">
                                                        <div className="text-center">
                                                            <div className="text-[9px] text-slate-500 font-black uppercase mb-0.5">Views</div>
                                                            <div className="text-xs font-black text-primary-400">{article.views.toLocaleString()}</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-[9px] text-slate-500 font-black uppercase mb-0.5">Pos</div>
                                                            <div className={`text-xs font-black ${article.position < 10 && article.position > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                                {article.position > 0 ? article.position.toFixed(1) : '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {article.has_draft ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                            Draft
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                            Live
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 transition-all">
                                                        <button
                                                            onClick={() => setViewingStats(article)}
                                                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all border border-transparent hover:border-emerald-500/20"
                                                            title="Intel Breakdown"
                                                        >
                                                            <BarChart3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setSharingArticle(article)}
                                                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all border border-transparent hover:border-blue-500/20"
                                                            title="Tracked Share"
                                                        >
                                                            <Share2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingArticle(article)}
                                                            className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all border border-transparent hover:border-primary-500/20"
                                                            title="Quick SEO Edit"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <a
                                                            href={`/article/${article.slug}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-2 text-slate-500 hover:bg-white/5 rounded-xl transition-all"
                                                            title="Preview"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-800 flex items-center justify-between">
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                    Page {artPage} / {articleData?.pages || 1}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={artPage <= 1}
                                        onClick={() => setArtPage(p => p - 1)}
                                        className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-black text-slate-400 uppercase tracking-widest disabled:opacity-30 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        disabled={artPage >= (articleData?.pages || 1)}
                                        onClick={() => setArtPage(p => p + 1)}
                                        className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-black text-slate-400 uppercase tracking-widest disabled:opacity-30 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Intelligence Insights</h2>
                        </div>

                        <div className="space-y-6">
                            {stats?.categories_performance?.map((cat) => (
                                <div key={cat.name} className="card overflow-hidden">
                                    {/* Category Header Stats */}
                                    <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-primary-600/20 flex items-center justify-center text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-900/20">
                                                <FolderOpen className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white uppercase tracking-tight">{cat.name}</h3>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{cat.count} Operations</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-center">
                                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Total Impact</div>
                                                <div className="text-sm font-black text-primary-400">{cat.total_views.toLocaleString()}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Avg Visibility</div>
                                                <div className={`text-sm font-black ${cat.avg_position < 10 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                    {cat.avg_position > 0 ? cat.avg_position.toFixed(1) : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Articles Table */}
                                    <div className="p-2">
                                        <div className="text-[9px] px-4 py-3 text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                                            <TrendingUp className="w-3 h-3" />
                                            Priority Intel
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <tbody className="divide-y divide-slate-800/30">
                                                    {cat.top_articles?.map((article, idx) => (
                                                        <tr key={article.id} className="group hover:bg-white/5 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-sm font-bold text-slate-200 line-clamp-1 group-hover:text-primary-400 transition-colors">
                                                                        {article.title}
                                                                    </div>
                                                                    {idx === 0 && (
                                                                        <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-tighter border border-emerald-500/20">Elite</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center justify-end gap-6">
                                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                                                                        <Eye className="w-3 h-3 text-primary-400" />
                                                                        <span className="text-slate-300">{article.views.toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 transition-all">
                                                                        <button
                                                                            onClick={() => setSharingArticle(article)}
                                                                            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                                                                            title="Tracked Share"
                                                                        >
                                                                            <Share2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEditingArticle(article)}
                                                                            className="p-1.5 text-primary-400 hover:bg-primary-500/10 rounded-lg"
                                                                        >
                                                                            <Edit3 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <a
                                                                            href={`/article/${article.slug}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="p-1.5 text-slate-500 hover:bg-white/5 rounded-lg"
                                                                        >
                                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="card p-12 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-slate-700" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Protocol Pending</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto uppercase tracking-widest text-[10px]">
                            We're currently perfecting the core settings management system to ensure maximum security performance.
                        </p>
                    </div>
                )}

                {activeTab === 'guide' && <AdminGuide />}

            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 safe-area-bottom">
                <div className="grid grid-cols-5 h-16">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'overview' ? 'text-primary-400' : 'text-slate-500'}`}
                    >
                        <LayoutDashboard className={`w-5 h-5 ${activeTab === 'overview' ? 'fill-current opacity-20' : ''}`} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Stats</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('articles')}
                        className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'articles' ? 'text-primary-400' : 'text-slate-500'}`}
                    >
                        <FileText className={`w-5 h-5 ${activeTab === 'articles' ? 'fill-current opacity-20' : ''}`} />
                        <span className="text-[9px] font-black uppercase tracking-wider">News</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'categories' ? 'text-primary-400' : 'text-slate-500'}`}
                    >
                        <FolderOpen className={`w-5 h-5 ${activeTab === 'categories' ? 'fill-current opacity-20' : ''}`} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Insight</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'settings' ? 'text-primary-400' : 'text-slate-500'}`}
                    >
                        <SettingsIcon className={`w-5 h-5 ${activeTab === 'settings' ? 'fill-current opacity-20' : ''}`} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Set</span>
                    </button>
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center space-y-1 text-emerald-500"
                    >
                        <Globe className="w-5 h-5" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Live</span>
                    </a>
                </div>
            </div>

            {
                editingArticle && (
                    <QuickEditModal
                        article={editingArticle}
                        onClose={() => setEditingArticle(null)}
                        onSave={handleSaveEdit}
                    />
                )
            }
            {sharingArticle && (
                <ShareModal
                    article={sharingArticle}
                    onClose={() => setSharingArticle(null)}
                />
            )}
            {viewingStats && (
                <SourceStatsModal
                    article={viewingStats}
                    onClose={() => setViewingStats(null)}
                />
            )}
        </div >
    );
}
