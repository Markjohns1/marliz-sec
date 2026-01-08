import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
    Share,
    PenLine,
    Mail
} from 'lucide-react';

// API & Components
import {
    getDashboardStats,
    triggerNewsFetch,
    triggerSimplify,
    logout,
    updateArticle,
    getArticleStats,
    getAdminArticles,
    publishArticle
} from '../services/api';

import AdminGuide from '../components/AdminGuide';
import StatCard from '../components/admin/StatCard';
import GrowthBadge from '../components/admin/GrowthBadge';
import QuickEditModal from '../components/admin/QuickEditModal';
import ShareModal from '../components/admin/ShareModal';
import SourceStatsModal from '../components/admin/SourceStatsModal';

// Tabs
import OverviewTab from '../components/admin/OverviewTab';
import ArticlesTab from '../components/admin/ArticlesTab';
import InsightsTab from '../components/admin/InsightsTab';
import SettingsTab from '../components/admin/SettingsTab';
import QuickPublishTab from '../components/admin/QuickPublishTab';
import NewsletterTab from '../components/admin/NewsletterTab';



export default function AdminDashboard() {
    const navigate = useNavigate();
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, articles, categories, settings
    const [editingArticle, setEditingArticle] = useState(null);
    const [sharingArticle, setSharingArticle] = useState(null);
    const [viewingStats, setViewingStats] = useState(null);
    const [selectedSubscribers, setSelectedSubscribers] = useState([]); // Shared targeting state

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
                {/* Primary Admin Top Bar - Mobile Optimized */}
                <div className="bg-slate-900 border-b border-white/5 text-white px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
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

                        {/* Mobile Logout Button (Visible only on small screens next to logo) */}
                        <div className="sm:hidden">
                            <button
                                onClick={handleLogout}
                                className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-4">
                        <a
                            href="/"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 text-xs font-bold text-slate-300"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Site
                        </a>
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
                            { id: 'publish', label: 'Publish', icon: PenLine },
                            { id: 'newsletter', label: 'Newsletter', icon: Mail },
                            { id: 'categories', label: 'Insights', icon: FolderOpen },
                            { id: 'guide', label: 'Playbook', icon: BookOpen },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                data-tab={tab.id}
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

            {/* Main Content - Substantially increased padding to clear the stacked mobile header */}
            <div className="container mx-auto max-w-6xl px-4 pt-48 md:pt-40 pb-32">

                {activeTab === 'overview' && (
                    <OverviewTab
                        stats={stats}
                        isLoading={isLoading}
                        actionLoading={actionLoading}
                        handleAction={handleAction}
                        triggerNewsFetch={triggerNewsFetch}
                        triggerSimplify={triggerSimplify}
                        message={message}
                        setViewingStats={setViewingStats}
                        setSharingArticle={setSharingArticle}
                        handleToggleProtection={handleToggleProtection}
                    />
                )}

                {activeTab === 'articles' && (
                    <ArticlesTab
                        artSearch={artSearch}
                        setArtSearch={setArtSearch}
                        setArtPage={setArtPage}
                        artSort={artSort}
                        setArtSort={setArtSort}
                        artLoading={artLoading}
                        articleData={articleData}
                        artPage={artPage}
                        setViewingStats={setViewingStats}
                        setSharingArticle={setSharingArticle}
                        setEditingArticle={setEditingArticle}
                        targetAudience={selectedSubscribers}
                        clearTargetAudience={() => setSelectedSubscribers([])}
                    />
                )}

                {activeTab === 'categories' && (
                    <InsightsTab
                        stats={stats}
                        setSharingArticle={setSharingArticle}
                        setEditingArticle={setEditingArticle}
                    />
                )}

                {activeTab === 'settings' && <SettingsTab />}

                {activeTab === 'publish' && (
                    <QuickPublishTab onPublishSuccess={() => { refetch(); artRefetch(); }} />
                )}

                {activeTab === 'newsletter' && (
                    <NewsletterTab
                        selectedSubscribers={selectedSubscribers}
                        setSelectedSubscribers={setSelectedSubscribers}
                    />
                )}

                {activeTab === 'guide' && <AdminGuide />}

            </div>

            {/* Mobile Bottom Navigation - More Comprehensive */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50 safe-area-bottom">
                <div className="grid grid-cols-6 h-16">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'overview' ? 'text-primary-400' : 'text-slate-500'}`}
                    >
                        <LayoutDashboard className={`w-5 h-5 ${activeTab === 'overview' ? 'fill-current opacity-20' : ''}`} />
                        <span className="text-[8px] font-black uppercase">Stats</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('articles')}
                        className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'articles' ? 'text-primary-400' : 'text-slate-500'}`}
                    >
                        <FileText className={`w-5 h-5 ${activeTab === 'articles' ? 'fill-current opacity-20' : ''}`} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">News</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('publish')}
                        className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'publish' ? 'text-primary-400' : 'text-slate-500'}`}
                    >
                        <PenLine className={`w-5 h-5 ${activeTab === 'publish' ? 'fill-current opacity-20' : ''}`} />
                        <span className="text-[8px] font-black uppercase">Publish</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('newsletter')}
                        className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'newsletter' ? 'text-primary-400' : 'text-slate-500'}`}
                    >
                        <Mail className={`w-5 h-5 ${activeTab === 'newsletter' ? 'fill-current opacity-20' : ''}`} />
                        <span className="text-[8px] font-black uppercase">NewsL</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'categories' ? 'text-primary-400' : 'text-slate-500'}`}
                    >
                        <FolderOpen className={`w-5 h-5 ${activeTab === 'categories' ? 'fill-current opacity-20' : ''}`} />
                        <span className="text-[8px] font-black uppercase">Insight</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('guide')}
                        className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'guide' ? 'text-primary-400' : 'text-slate-500'}`}
                    >
                        <BookOpen className={`w-5 h-5 ${activeTab === 'guide' ? 'fill-current opacity-20' : ''}`} />
                        <span className="text-[8px] font-black uppercase">Guide</span>
                    </button>
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
