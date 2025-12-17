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
    ShieldOff
} from 'lucide-react';


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

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState(null);

    // Fetch Stats
    const { data: stats, isLoading, refetch } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: getDashboardStats,
        retry: false,
        onError: () => {
            logout();
            navigate('/console/login');
        }
    });

    const handleLogout = () => {
        logout();
        navigate('/console/login');
    };

    const handleToggleProtection = async (articleId, currentStatus) => {
        try {
            await updateArticle(articleId, {
                protected_from_deletion: !currentStatus,
                edited_by: 'admin' // Required by schema
            });
            refetch(); // Refresh to see changes
            setMessage({ type: 'success', text: `Success: Article protection ${!currentStatus ? 'enabled' : 'disabled'}.` });
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        }
    };

    const handleAction = async (actionFn, name) => {
        // ... (existing handleAction)
        setActionLoading(name);
        setMessage(null);
        try {
            const result = await actionFn();
            setMessage({ type: 'success', text: `Success: ${name} completed.` });
            refetch();
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* ... (Helmet and Top Bar remain same) */}
            <Helmet>
                <title>Admin Dashboard | Marliz Security</title>
            </Helmet>

            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-16 z-30">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-primary-600" />
                    <h1 className="text-base sm:text-lg font-bold text-slate-900">Analytics Dashboard</h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">

                {/* Welcome */}
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome back, Admin</h2>
                    <p className="text-sm sm:text-base text-slate-500">Here's what's happening with your system.</p>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <StatCard
                        title="Total Articles"
                        value={stats?.total_articles}
                        icon={FileText}
                        color="bg-blue-500"
                        loading={isLoading}
                    />
                    <StatCard
                        title="Total Views"
                        value={stats?.total_views}
                        icon={Eye}
                        color="bg-purple-500"
                        loading={isLoading}
                    />
                    <StatCard
                        title="Published"
                        value={stats?.published}
                        icon={CheckCircle}
                        color="bg-green-500"
                        loading={isLoading}
                    />
                    <StatCard
                        title="Pending AI"
                        value={stats?.pending}
                        icon={Clock}
                        color="bg-orange-500"
                        loading={isLoading}
                    />
                </div>

                {/* Time-Based Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <StatCard
                        title="Today"
                        value={stats?.articles_today}
                        icon={Calendar}
                        color="bg-indigo-500"
                        loading={isLoading}
                        subtitle="new articles"
                    />
                    <StatCard
                        title="This Week"
                        value={stats?.articles_this_week}
                        icon={BarChart3}
                        color="bg-cyan-500"
                        loading={isLoading}
                        subtitle="last 7 days"
                    />
                    <StatCard
                        title="Avg Views"
                        value={stats?.avg_views}
                        icon={TrendingUp}
                        color="bg-pink-500"
                        loading={isLoading}
                        subtitle="per article"
                    />
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="p-2 sm:p-3 rounded-xl bg-emerald-500">
                                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-slate-500 text-xs sm:text-sm font-medium mb-1">Weekly Growth</h3>
                        <div className="flex items-center gap-2">
                            {isLoading ? (
                                <span className="text-2xl font-bold text-slate-900">...</span>
                            ) : (
                                <GrowthBadge value={stats?.growth_pct || 0} />
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">vs last week</p>
                    </div>
                </div>

                {/* Action Panel + Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">

                    {/* Controls */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm h-fit">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Quick Actions
                        </h3>

                        <div className="space-y-3 sm:space-y-4">
                            <button
                                onClick={() => handleAction(triggerNewsFetch, 'News Fetch')}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                                        <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-600 ${actionLoading === 'News Fetch' ? 'animate-spin' : ''}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-sm sm:text-base text-slate-900">Fetch News</div>
                                        <div className="text-xs text-slate-500">Pull latest from NewsData.io</div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleAction(triggerSimplify, 'AI Simplifier')}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                                        <Zap className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-600 ${actionLoading === 'AI Simplifier' ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-sm sm:text-base text-slate-900">Run AI Processor</div>
                                        <div className="text-xs text-slate-500">Simplify pending articles</div>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {message && (
                            <div className={`mt-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                                }`}>
                                {message.text}
                            </div>
                        )}
                    </div>

                    {/* Trending Now */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            Trending Now
                            <span className="text-xs font-normal text-slate-400 ml-1">(Last 48h)</span>
                        </h3>

                        <div className="space-y-3">
                            {stats?.trending_articles?.length > 0 ? (
                                stats.trending_articles.map((article, idx) => (
                                    <div key={article.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-orange-100 text-orange-600' :
                                            idx === 1 ? 'bg-slate-100 text-slate-600' :
                                                'bg-slate-50 text-slate-400'
                                            }`}>{idx + 1}</span>
                                        <span className="flex-1 text-sm text-slate-700 truncate">{article.title}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleProtection(article.id, article.protected)}
                                                className={`p-1 rounded-full transition-colors ${article.protected ? 'bg-green-100 text-green-600' : 'hover:bg-slate-200 text-slate-400'}`}
                                                title={article.protected ? "Protected (Evergreen)" : "Not Protected (Deletes in 30d)"}
                                            >
                                                {article.protected ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                                            </button>
                                            <span className="text-xs font-mono text-slate-500">{article.views} views</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-4">No trending articles in the last 48 hours</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Bottom Grid: Categories + Top All-Time */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

                    {/* Categories Breakdown */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-blue-500" />
                            Categories Breakdown
                        </h3>

                        <div className="space-y-3">
                            {stats?.categories_breakdown?.map((cat, idx) => (
                                <div key={cat.name} className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                                            <span className="text-xs text-slate-500">{cat.count} articles</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                                                style={{ width: `${(cat.count / (stats.total_articles || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!stats?.categories_breakdown || stats.categories_breakdown.length === 0) && (
                                <p className="text-sm text-slate-400 text-center py-4">No category data available</p>
                            )}
                        </div>
                    </div>

                    {/* Top All-Time */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            Top Performing (All Time)
                        </h3>

                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full text-left min-w-[300px]">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-3 pl-4 sm:pl-0 text-xs font-semibold text-slate-500 uppercase">Article</th>
                                        <th className="pb-3 pr-4 sm:pr-0 text-xs font-semibold text-slate-500 uppercase text-right">Views</th>
                                        <th className="pb-3 pr-4 sm:pr-0 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats?.top_articles?.map((article) => (
                                        <tr key={article.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-3 pr-4 pl-4 sm:pl-0">
                                                <span className="font-medium text-sm text-slate-700 group-hover:text-primary-600 transition-colors line-clamp-1">
                                                    {article.title}
                                                    {article.protected && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Protected</span>}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 sm:pr-0 text-right font-mono text-sm text-slate-600">
                                                {article.views.toLocaleString()}
                                            </td>
                                            <td className="py-3 pr-4 sm:pr-0 text-right">
                                                <button
                                                    onClick={() => handleToggleProtection(article.id, article.protected)}
                                                    className={`p-1.5 rounded-md text-xs font-medium transition-colors ${article.protected ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                >
                                                    {article.protected ? 'Unprotect' : 'Protect'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!stats?.top_articles || stats.top_articles.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className="py-4 text-center text-slate-400 text-sm">
                                                No data available yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
