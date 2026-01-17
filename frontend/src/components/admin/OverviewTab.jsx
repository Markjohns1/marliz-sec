import React from 'react';
import {
    FileText, Globe, Zap, BarChart3, Search,
    Flame, RefreshCw, Shield, ShieldOff, Share2,
    ChevronDown, ChevronUp
} from 'lucide-react';
import StatCard from './StatCard';
import GrowthBadge from './GrowthBadge';

export default function OverviewTab({
    stats,
    isLoading,
    actionLoading,
    handleAction,
    triggerNewsFetch,
    triggerSimplify,
    message,
    setViewingStats,
    setSharingArticle,
    handleToggleProtection,
    systemStatus,
    handleToggleScheduler
}) {
    const [isTrafficExpanded, setIsTrafficExpanded] = React.useState(false);

    return (
        <div className="animate-in fade-in duration-500">
            {/* System Overview Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight">System Status</h2>
                <p className="text-sm text-slate-400 font-medium italic">Autonomous Intelligence Engine</p>
            </div>

            {/* Primary Grid - 2x2 on mobile, 1x4 on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Intelligence Library"
                    value={stats?.total_articles}
                    icon={FileText}
                    color="bg-blue-600"
                    loading={isLoading}
                    subtitle="Total reports"
                />
                <StatCard
                    title="Public Impact"
                    value={stats?.total_views}
                    icon={Globe}
                    color="bg-purple-600"
                    loading={isLoading}
                    subtitle="Global readership"
                />
                <StatCard
                    title="Fresh Intel"
                    value={stats?.articles_today}
                    icon={Zap}
                    color="bg-yellow-600"
                    loading={isLoading}
                    subtitle="Today's reports"
                />
                <StatCard
                    title="Engagement"
                    value={stats?.avg_views}
                    icon={BarChart3}
                    color="bg-emerald-600"
                    loading={isLoading}
                    subtitle="Avg interest"
                />
            </div>

            {/* Platform Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 border-l-4 border-l-blue-500">
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Publishing Streak</h3>
                    <div className="flex items-center gap-2">
                        <GrowthBadge value={stats?.growth_pct || 0} />
                        <span className="text-xs font-bold text-slate-400">Activity Rank</span>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 border-l-4 border-l-purple-500">
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Search Visibility</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{stats?.global_avg_position || '0.0'}</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase">Avg Pos</span>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 border-l-4 border-l-orange-500">
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Top Domain</h3>
                    <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-lg font-black text-white uppercase truncate">{stats?.top_category || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Traffic Origins - Mobile Optimized Card List */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-white uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-blue-400" />
                        Traffic Origins
                    </h3>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                    {/* Desktop Header */}
                    <div className="hidden md:grid grid-cols-12 bg-slate-900/80 p-4 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <div className="col-span-4">Platform</div>
                        <div className="col-span-5">Intelligence Source</div>
                        <div className="col-span-3 text-right">Signals (Hits)</div>
                    </div>

                    <div className="divide-y divide-slate-800/50">
                        {stats?.traffic_sources && stats.traffic_sources.length > 0 ? (
                            <>
                                {stats.traffic_sources.slice(0, isTrafficExpanded ? undefined : 5).map((source, idx) => {
                                    const explanations = {
                                        'Direct Access': 'Direct entry or bookmarks',
                                        'Google Search': 'Organic Google traffic',
                                        'Bing Search': 'Organic Bing traffic',
                                        'DuckDuckGo': 'Organic DDG traffic',
                                        'Facebook': 'Social referral (Meta)',
                                        'Facebook App': 'Mobile Meta Referral',
                                        'WhatsApp': 'Direct share via WA Messenger',
                                        'WhatsApp Preview': 'WA Crawler / Link Preview',
                                        'LinkedIn': 'Professional Network referral',
                                        'LinkedIn App': 'Mobile LinkedIn Referral',
                                        'X (Twitter)': 'X Network referral',
                                        'X (Twitter) App': 'Mobile X Referral',
                                        'Telegram': 'Encrypted Messenger Referral',
                                        'Discord': 'Community referral (Discord)',
                                        'Instagram': 'Visual social referral',
                                        'Instagram App': 'Mobile Instagram Referral',
                                        'Search Engine Bot': 'Indexing crawler (SEO active)',
                                        'AI Intelligence Bot': 'LLM / AI training agent',
                                        'Other Referrals': 'External site links',
                                        'other': 'Undocumented signal'
                                    };
                                    const explanation = explanations[source.platform] || 'External channel traffic';

                                    return (
                                        <div key={idx} className="flex flex-col gap-1 p-4 md:grid md:grid-cols-12 hover:bg-white/[0.02] transition-colors border-b border-white/5 md:border-0 last:border-0">
                                            <div className="md:col-span-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                    <span className="text-xs font-black text-white">{source.platform}</span>
                                                </div>
                                                <div className="md:hidden text-xs font-black text-blue-400">
                                                    {source.hits.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="md:col-span-5">
                                                <p className="text-[10px] md:text-sm text-slate-500 font-medium leading-relaxed italic">
                                                    {explanation}
                                                </p>
                                            </div>
                                            <div className="hidden md:flex md:col-span-3 text-right items-center justify-end">
                                                <span className="text-xs font-black text-blue-400">
                                                    {source.hits.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {stats.traffic_sources.length > 5 && (
                                    <button
                                        onClick={() => setIsTrafficExpanded(!isTrafficExpanded)}
                                        className="w-full py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        {isTrafficExpanded ? (
                                            <>Show Less <ChevronUp className="w-3 h-3" /></>
                                        ) : (
                                            <>Show All Data ({stats.traffic_sources.length}) <ChevronDown className="w-3 h-3" /></>
                                        )}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic animate-pulse">Scanning for incoming signals...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* System Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
                <h3 className="font-black text-white uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Operational Controls
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleAction(triggerNewsFetch, 'News Fetch')}
                        disabled={actionLoading || !systemStatus?.scheduler_enabled}
                        className={`flex items-center gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800 transition-all group ${!systemStatus?.scheduler_enabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500/50'}`}
                        title={!systemStatus?.scheduler_enabled ? "Automation must be ENABLED in Settings to use this." : ""}
                    >
                        <div className={`p-3 rounded-xl transition-all ${!systemStatus?.scheduler_enabled ? 'bg-slate-800 text-slate-600' : 'bg-primary-900/30 text-primary-400 group-hover:bg-primary-500 group-hover:text-white'}`}>
                            <RefreshCw className={`w-5 h-5 ${actionLoading === 'News Fetch' ? 'animate-spin' : ''}`} />
                        </div>
                        <div className="text-left">
                            <div className="font-black text-white uppercase tracking-tight text-sm">Force Sync</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Poll Intelligence Sources</div>
                        </div>
                    </button>
                    <button
                        onClick={() => handleAction(triggerSimplify, 'Intel Processing')}
                        disabled={actionLoading || !systemStatus?.scheduler_enabled}
                        className={`relative flex items-center gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800 transition-all group overflow-hidden ${!systemStatus?.scheduler_enabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500/50'}`}
                        title={!systemStatus?.scheduler_enabled ? "Automation must be ENABLED in Settings to use this." : ""}
                    >
                        {stats?.pending > 0 && (
                            <div className={`absolute top-0 right-0 px-3 py-1 text-white text-[9px] font-black uppercase tracking-tighter rounded-bl-xl shadow-lg ${!systemStatus?.scheduler_enabled ? 'bg-slate-700' : 'bg-purple-600'}`}>
                                {stats.pending} QUEUED
                            </div>
                        )}
                        <div className={`p-3 rounded-xl transition-all ${!systemStatus?.scheduler_enabled ? 'bg-slate-800 text-slate-600' : 'bg-purple-900/30 text-purple-400 group-hover:bg-purple-500 group-hover:text-white'}`}>
                            <Zap className={`w-5 h-5 ${actionLoading === 'Intel Processing' ? 'animate-pulse' : ''}`} />
                        </div>
                        <div className="text-left">
                            <div className="font-black text-white uppercase tracking-tight text-sm">Intel Processor</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Engage Analysis Engine</div>
                        </div>
                    </button>
                </div>

                {actionLoading && (
                    <div className="mt-6 p-4 rounded-xl bg-blue-900/10 border border-blue-500/20 flex items-center gap-4 animate-pulse">
                        <div className="flex gap-1">
                            <div className="w-1 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">Intelligence Stream Active</p>
                            <p className="text-[11px] font-bold text-white mt-1">System is processing and auto-refreshing dashboard...</p>
                        </div>
                    </div>
                )}

                {message && (
                    <div className={`mt-6 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border ${message.type === 'error' ? 'bg-red-950/20 text-red-500 border-red-900/30' : 'bg-emerald-950/20 text-emerald-500 border-emerald-900/30'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Hot Topics Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8">
                <h3 className="font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <Flame className="w-4 h-4 text-orange-500" />
                    High-Interest Intelligence
                </h3>
                <div className="space-y-3">
                    {stats?.trending_articles?.map((article, idx) => (
                        <div key={article.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group bg-slate-950/30 border border-slate-900">
                            <div className="text-xl font-black text-slate-800 group-hover:text-primary-500/50 transition-colors w-8">0{idx + 1}</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors truncate">{article.title}</div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{article.views.toLocaleString()} Total Reach</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setViewingStats(article)} className="p-3 sm:p-2.5 rounded-xl bg-slate-900 text-emerald-500 border border-slate-800 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all">
                                    <BarChart3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setSharingArticle(article)} className="p-3 sm:p-2.5 rounded-xl bg-slate-900 text-blue-500 border border-slate-800 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all">
                                    <Share2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleToggleProtection(article.id, article.protected)} className={`p-3 sm:p-2.5 rounded-xl transition-all border ${article.protected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-700 border-slate-800 hover:border-slate-500'}`}>
                                    {article.protected ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
