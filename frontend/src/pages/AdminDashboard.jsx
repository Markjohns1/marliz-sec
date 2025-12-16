import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, triggerNewsFetch, triggerSimplify, logout } from '../services/api';
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
    AlertTriangle
} from 'lucide-react';

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            {loading && <div className="h-2 w-16 bg-slate-100 rounded animate-pulse"></div>}
        </div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-slate-900">
            {loading ? "..." : value?.toLocaleString()}
        </p>
    </div>
);

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

    const handleAction = async (actionFn, name) => {
        setActionLoading(name);
        setMessage(null);
        try {
            const result = await actionFn();
            setMessage({ type: 'success', text: `Success: ${name} completed.` });
            refetch(); // Refresh stats
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
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-16 z-30">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-primary-600" />
                    <h1 className="text-lg font-bold text-slate-900">System Overview</h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-8">

                {/* Welcome */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Welcome back, Admin</h2>
                    <p className="text-slate-500">Here's what's happening with your system today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

                {/* Action Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Controls */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Quick Actions
                        </h3>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleAction(triggerNewsFetch, 'News Fetch')}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                                        <RefreshCw className={`w-5 h-5 text-slate-600 ${actionLoading === 'News Fetch' ? 'animate-spin' : ''}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-slate-900">Fetch News</div>
                                        <div className="text-xs text-slate-500">Pull latest from NewsData.io</div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleAction(triggerSimplify, 'AI Simplifier')}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                                        <Zap className={`w-5 h-5 text-slate-600 ${actionLoading === 'AI Simplifier' ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-slate-900">Run AI Processor</div>
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

                    {/* Top Content */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Top Performing Content
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Article Title</th>
                                        <th className="pb-3 text-xs font-semibold text-slate-500 uppercase text-right">Views</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats?.top_articles?.map((article) => (
                                        <tr key={article.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-3 pr-4">
                                                <span className="font-medium text-slate-700 group-hover:text-primary-600 transition-colors line-clamp-1">
                                                    {article.title}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right font-mono text-slate-600">
                                                {article.views.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!stats?.top_articles || stats.top_articles.length === 0) && (
                                        <tr>
                                            <td colSpan="2" className="py-4 text-center text-slate-400 text-sm">
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
