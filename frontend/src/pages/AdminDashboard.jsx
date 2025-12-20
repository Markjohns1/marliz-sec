import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, triggerNewsFetch, triggerSimplify, logout, updateArticle } from '../services/api';
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
    Settings as SettingsIcon
} from 'lucide-react';
import { getAdminArticles, publishArticle } from '../services/api';


// Helper Components
function StatCard({ title, value, icon: Icon, color, loading, subtitle }) {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-xl ${color}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
            </div>
            <h3 className="text-slate-500 text-xs sm:text-sm font-medium mb-1">{title}</h3>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {loading ? '...' : (value?.toLocaleString() || 0)}
            </div>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
    );
}

function GrowthBadge({ value }) {
    const isPositive = value >= 0;
    return (
        <div className={`flex items-center gap-1 text-lg sm:text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-primary-600" />
                        <h3 className="font-bold text-slate-900">Quick SEO Edit</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-sm font-semibold text-slate-700">SEO Title</label>
                            <span className={`text-xs ${draftTitle.length > 60 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                {draftTitle.length}/60
                            </span>
                        </div>
                        <input
                            type="text"
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
                            placeholder="Enter catchy SEO title..."
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Rule: [Entity] [Event]: [Impact] – [Urgency]</p>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-sm font-semibold text-slate-700">Meta Description</label>
                            <span className={`text-xs ${draftMeta.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                {draftMeta.length}/160
                            </span>
                        </div>
                        <textarea
                            value={draftMeta}
                            onChange={(e) => setDraftMeta(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                            placeholder="Hook + Details + Call to Action..."
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Keywords</label>
                        <input
                            type="text"
                            value={draftKeywords}
                            onChange={(e) => setDraftKeywords(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                            placeholder="keyword1, keyword2, keyword3..."
                        />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                        <div className="text-xs text-blue-800 leading-relaxed">
                            <strong>Note:</strong> Saving as draft stores your changes privately.
                            Clicking <strong>Save & Publish</strong> makes them visible to search engines and users immediately.
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={saving}
                        onClick={() => handleAction(false)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        disabled={saving}
                        onClick={() => handleAction(true)}
                        className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg shadow-primary-200"
                    >
                        <Zap className="w-4 h-4 fill-current" />
                        {saving ? 'Publishing...' : 'Save & Publish'}
                    </button>
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

    // Filter States for Articles Tab
    const [artSearch, setArtSearch] = useState('');
    const [artSort, setArtSort] = useState('date');
    const [artPage, setArtPage] = useState(1);

    // Fetch Stats
    const { data: stats, isLoading, refetch } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: getDashboardStats,
        retry: false,
        refetchInterval: 30000,
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
        try {
            const result = await actionFn();
            if (result.processed !== undefined) {
                setMessage({ type: 'success', text: `✓ Processed ${result.processed} articles.` });
            } else if (result.total_new !== undefined) {
                setMessage({ type: 'success', text: `✓ Fetched ${result.total_new} new articles.` });
            } else {
                setMessage({ type: 'success', text: `✓ ${name} completed.` });
            }
            await refetch();
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Helmet>
                <title>Admin Dashboard | Marliz Security</title>
            </Helmet>

            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-16 z-30">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-primary-600" />
                    <h1 className="text-base sm:text-lg font-bold text-slate-900">Analytics Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live System
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 pt-6">
                {/* Navigation Tabs */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 mb-8 w-fit shadow-sm">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'articles', label: 'Edit Articles', icon: Edit3 },
                        { id: 'categories', label: 'Categories', icon: FolderOpen },
                        { id: 'settings', label: 'Settings', icon: SettingsIcon },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-500">
                        {/* Welcome */}
                        <div className="mb-6 sm:mb-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome back, Admin</h2>
                            <p className="text-sm sm:text-base text-slate-500">Here's what's happening with your system.</p>
                        </div>

                        {/* Primary Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                            <StatCard title="Total Articles" value={stats?.total_articles} icon={FileText} color="bg-blue-500" loading={isLoading} />
                            <StatCard title="Total Views" value={stats?.total_views} icon={Eye} color="bg-purple-500" loading={isLoading} />
                            <StatCard title="Published" value={stats?.published} icon={CheckCircle} color="bg-green-500" loading={isLoading} />
                            <StatCard title="Pending AI" value={stats?.pending} icon={Clock} color="bg-orange-500" loading={isLoading} />
                        </div>

                        {/* Growth & Performance */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                <h3 className="text-slate-500 text-sm font-medium mb-1">Weekly Growth</h3>
                                <div className="flex items-center gap-2">
                                    <GrowthBadge value={stats?.growth_pct || 0} />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">based on new articles vs last week</p>
                            </div>
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    Quick Actions
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleAction(triggerNewsFetch, 'News Fetch')}
                                        disabled={actionLoading}
                                        className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                                    >
                                        <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-white text-primary-600">
                                            <RefreshCw className={`w-5 h-5 ${actionLoading === 'News Fetch' ? 'animate-spin' : ''}`} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-slate-900">Fetch News</div>
                                            <div className="text-xs text-slate-500">Latest from NewsData.io</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleAction(triggerSimplify, 'AI Simplifier')}
                                        disabled={actionLoading}
                                        className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                                    >
                                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-white text-purple-600">
                                            <Zap className={`w-5 h-5 ${actionLoading === 'AI Simplifier' ? 'animate-pulse' : ''}`} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-slate-900">Run AI Processor</div>
                                            <div className="text-xs text-slate-500">Simplify pending content</div>
                                        </div>
                                    </button>
                                </div>
                                {message && (
                                    <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                                        {message.text}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trending Articles */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden mb-8">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-500" />
                                Trending Topics
                            </h3>
                            <div className="space-y-4">
                                {stats?.trending_articles?.map((article, idx) => (
                                    <div key={article.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                        <div className="text-lg font-black text-slate-200 group-hover:text-primary-200 transition-colors w-6">#{idx + 1}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-slate-800 truncate">{article.title}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{article.views} total views</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleProtection(article.id, article.protected)}
                                                className={`p-2 rounded-lg transition-colors ${article.protected ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
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
                            <h2 className="text-2xl font-bold text-slate-900">Manage Articles</h2>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search articles..."
                                        value={artSearch}
                                        onChange={(e) => { setArtSearch(e.target.value); setArtPage(1); }}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all"
                                    />
                                </div>
                                <select
                                    value={artSort}
                                    onChange={(e) => setArtSort(e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                                >
                                    <option value="date">Most Recent</option>
                                    <option value="views">Most Views</option>
                                    <option value="impressions">Impressions</option>
                                    <option value="position">GSC Position</option>
                                </select>
                            </div>
                        </div>

                        {/* Article Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Article Info</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stats</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {artLoading ? (
                                            <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">Loading articles...</td></tr>
                                        ) : articleData?.articles.map((article) => (
                                            <tr key={article.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4 max-w-md">
                                                    <div className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">{article.title}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-tighter">
                                                            {article.category?.name || 'General'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(article.published_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="space-y-0.5">
                                                            <div className="text-xs text-slate-400">Views</div>
                                                            <div className="text-sm font-mono font-bold text-slate-700">{article.views.toLocaleString()}</div>
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <div className="text-xs text-slate-400">GSC Pos.</div>
                                                            <div className={`text-sm font-mono font-bold ${article.position < 10 && article.position > 0 ? 'text-green-600' : 'text-slate-500'}`}>
                                                                {article.position > 0 ? article.position.toFixed(1) : '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {article.has_draft ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                                            Draft
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase">
                                                            Live
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditingArticle(article)}
                                                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                            title="Quick Edit SEO"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <a
                                                            href={`/article/${article.slug}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
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
                            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-xs text-slate-500 font-medium">
                                    Showing page {artPage} of {articleData?.pages || 1}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={artPage <= 1}
                                        onClick={() => setArtPage(p => p - 1)}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        disabled={artPage >= (articleData?.pages || 1)}
                                        onClick={() => setArtPage(p => p + 1)}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'categories' || activeTab === 'settings') && (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Coming Soon</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            We're currently perfecting the {activeTab} management system to ensure maximum security performance.
                        </p>
                    </div>
                )}
            </div>

            {editingArticle && (
                <QuickEditModal
                    article={editingArticle}
                    onClose={() => setEditingArticle(null)}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
    );
}
