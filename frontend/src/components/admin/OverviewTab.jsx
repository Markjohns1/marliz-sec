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
    handleToggleProtection
}) {
    const [isTrafficExpanded, setIsTrafficExpanded] = React.useState(false);

    return (
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
                    Traffic Origins
                </h3>
                <div className="card overflow-hidden border-slate-800 bg-slate-900/20">
                    <div className="grid grid-cols-12 bg-slate-900/60 p-3 border-b border-slate-800">
                        <div className="col-span-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform</div>
                        <div className="col-span-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">What This Means</div>
                        <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Hits</div>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {stats?.traffic_sources && stats.traffic_sources.length > 0 ? (
                            <>
                                {stats.traffic_sources.slice(0, isTrafficExpanded ? undefined : 5).map((source, idx) => {
                                    // Explanations for each traffic source
                                    const explanations = {
                                        'Direct Access': 'Typed URL directly or bookmarked your site',
                                        'Google Search': 'Found you via Google search results',
                                        'Bing Search': 'Found you via Bing search results',
                                        'DuckDuckGo': 'Found you via DuckDuckGo search',
                                        'Facebook': 'Clicked link from Facebook post or group',
                                        'Facebook App': 'Clicked from Facebook mobile app',
                                        'WhatsApp': 'Shared link opened from WhatsApp',
                                        'WhatsApp Preview': 'WhatsApp generating link preview',
                                        'LinkedIn': 'Clicked from LinkedIn post or message',
                                        'LinkedIn App': 'Clicked from LinkedIn mobile app',
                                        'X (Twitter)': 'Clicked from Twitter/X post',
                                        'X (Twitter) App': 'Clicked from Twitter/X mobile app',
                                        'Telegram': 'Clicked from Telegram group or channel',
                                        'Discord': 'Clicked from Discord server',
                                        'Instagram': 'Clicked from Instagram bio or story',
                                        'Instagram App': 'Clicked from Instagram mobile app',
                                        'Search Engine Bot': 'Google/Bing crawling your site (good for SEO!)',
                                        'AI Intelligence Bot': 'ChatGPT/Perplexity reading your content',
                                        'Other Referrals': 'Links from other websites, forums, or apps',
                                        'other': 'Unidentified referral source'
                                    };
                                    const explanation = explanations[source.platform] || 'Traffic from this source';

                                    return (
                                        <div key={idx} className="grid grid-cols-12 p-3 hover:bg-white/[0.02] transition-colors items-center">
                                            <div className="col-span-4 flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                <span className="text-xs font-bold text-slate-200">{source.platform}</span>
                                            </div>
                                            <div className="col-span-5">
                                                <span className="text-[10px] text-slate-500 italic">{explanation}</span>
                                            </div>
                                            <div className="col-span-3 text-right">
                                                <span className="text-sm font-black text-white px-2 py-0.5 bg-slate-950 rounded-lg border border-slate-800">
                                                    {source.hits.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {stats.traffic_sources.length > 5 && (
                                    <button
                                        onClick={() => setIsTrafficExpanded(!isTrafficExpanded)}
                                        className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        {isTrafficExpanded ? (
                                            <>
                                                Show Less <ChevronUp className="w-3 h-3" />
                                            </>
                                        ) : (
                                            <>
                                                Show All ({stats.traffic_sources.length}) <ChevronDown className="w-3 h-3" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
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
                        className="relative flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500 transition-all group overflow-hidden"
                    >
                        {/* Queue Indicator Badge */}
                        {stats?.pending > 0 && (
                            <div className="absolute top-0 right-0 px-3 py-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-tighter rounded-bl-xl shadow-lg animate-pulse">
                                {stats.pending} in queue
                            </div>
                        )}

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
            <div className="card p-6 mb-8 mt-8">
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
    );
}
