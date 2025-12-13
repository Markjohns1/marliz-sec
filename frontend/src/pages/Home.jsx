
import { useInfiniteQuery } from '@tanstack/react-query';
import { getArticles } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import ThreatDashboard from '../components/ThreatDashboard';
import { Shield, TrendingUp, Bell, ChevronRight, Database, FileWarning, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CategorySection from '../components/CategorySection';

export default function Home() {
  // const [page, setPage] = useState(1); // MIGRATED TO INFINITE QUERY
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['articles', 'infinite'], // Unique key to force fresh fetch
    queryFn: ({ pageParam = 1 }) => getArticles({ page: pageParam, limit: 12 }),
    getNextPageParam: (lastPage) => {
      // Assuming API returns { page: 1, pages: 10 }
      return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined;
    }
  });

  // Flatten all pages into one list of articles
  const allArticles = data?.pages.flatMap(page => page.articles) || [];

  // Calculate dynamic threat level from recent articles
  const currentThreatLevel = (() => {
    if (!allArticles.length) return 'medium';
    const levels = allArticles.slice(0, 10).map(a => a.simplified?.threat_level?.toLowerCase() || 'low');
    if (levels.includes('critical')) return 'critical';
    if (levels.includes('high')) return 'high';
    return 'medium';
  })();

  if (error) {
    return (
      <div className="w-full py-12 text-center px-4">
        <p className="text-red-600">Failed to load articles. Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Marliz Threat Intel - Live Security Monitoring</title>
        <meta
          name="description"
          content="Real-time threat intelligence for East African businesses. Monitor, Detect, and Prevent cyber attacks with Marliz Sec."
        />
        <meta name="keywords" content="Kenya cybersecurity, M-Pesa fraud, business threat intel, ransomware alerts" />
      </Helmet>

      {/* Live Threat Dashboard */}
      <ThreatDashboard stats={{ threatLevel: currentThreatLevel }} />

      {/* Hero Section - NOW FULL WIDTH */}
      <section className="bg-slate-900 text-white w-full border-b border-slate-800">
        <div className="w-full py-12 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-1.5 rounded-full mb-6 animate-pulse">
              <span className="flex h-2 w-2 relative mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase">Live Intelligence Feed</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Real. Talk. <br />
              <span className="text-primary-200">Cyber News You Can Actually Understand.</span>
            </h1>

            <p className="text-lg md:text-2xl text-primary-100 mb-8 leading-relaxed">
              Cybersecurity doesn't have to be complicated. We keep you safe—no matter who you are or what device you use.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/subscribe" className="bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg inline-flex items-center justify-center">
                <Bell className="w-5 h-5 mr-2" />
                Get Daily Threat Alerts
              </Link>
              <a href="#latest" className="bg-primary-500/30 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-500/40 transition-colors border border-white/20 inline-flex items-center justify-center">
                See Latest Threats
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles - DARK MODE */}
      <section id="latest" className="py-16 bg-slate-950 w-full">
        <div className="w-full px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Latest Threats</h2>
                <p className="text-slate-400">Updated every 4 hours with actionable insights</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card animate-pulse bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-800 aspect-video"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                      <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-800 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : allArticles.length > 0 ? (
              <>
                {/* BENTO GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                  {/* Featured Hero Article (Span 8) */}
                  <div className="lg:col-span-8">
                    <div className="mb-4 flex items-center space-x-2">
                      <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                      <h3 className="text-red-400 font-bold tracking-widest text-xs uppercase">Breaking Headline</h3>
                    </div>
                    {/* Render first article as Hero */}
                    <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                      <Link to={`/article/${allArticles[0].slug}`}>
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={allArticles[0].image_url}
                            alt={allArticles[0].title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
                        </div>
                        <div className="absolute bottom-0 p-8 w-full">
                          <span className="inline-block px-3 py-1 mb-4 text-xs font-bold text-blue-400 bg-blue-900/30 border border-blue-500/30 rounded-full backdrop-blur-md">
                            {allArticles[0].category?.name || 'FEATURED'}
                          </span>
                          <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-blue-400 transition-colors">
                            {allArticles[0].title}
                          </h2>
                          <p className="text-slate-300 text-lg line-clamp-2 max-w-3xl">
                            {allArticles[0]?.simplified?.friendly_summary}
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Trending Sidebar (Span 4) - STICKY ENABLED for Ads */}
                  {/* HIDDEN ON MOBILE/TABLET - Visible only on LG screens */}
                  <div className="hidden lg:block lg:col-span-4 relative">
                    <div className="sticky top-24 space-y-6">

                      {/* Ad Slot - Premium Placement */}
                      <div className="bg-slate-900/50 rounded-xl p-6 text-center border border-slate-800 border-dashed hover:border-blue-500/30 transition-colors flex flex-col items-center justify-center min-h-[250px]">
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase tracking-wider mb-2">Advertisement</span>
                        <p className="text-slate-600 text-sm">Your Ad Here</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-slate-400 font-bold tracking-widest text-xs uppercase flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Trending Now
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {/* List next 3 articles */}
                          {allArticles.slice(1, 4).map(article => (
                            <Link key={article.id} to={`/article/${article.slug}`} className="block group bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-600 transition-all shadow-sm hover:shadow-md">
                              <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 text-sm">
                                {article.title}
                              </h4>
                              <div className="flex items-center text-xs text-slate-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                                {article.category?.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Remaining Articles Grid */}
                <div className="mt-16">
                  {/* MOBILE AD SLOT (Visible only on small screens) */}
                  <div className="lg:hidden mb-12">
                    <div className="bg-slate-900/50 rounded-xl p-6 text-center border border-slate-800 border-dashed flex flex-col items-center justify-center min-h-[250px]">
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase tracking-wider mb-2">Advertisement</span>
                      <p className="text-slate-600 text-sm">Your Mobile Ad Here</p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                    <div className="w-1 h-8 bg-blue-500 mr-4 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    Latest Intelligence
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allArticles.slice(4).map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>

                {/* Load More Button */}
                <div className="flex justify-center mt-16 pb-12">
                  {hasNextPage ? (
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                          Loading more...
                        </>
                      ) : (
                        'Load More Articles'
                      )}
                    </button>
                  ) : (
                    <div className="text-slate-500 text-sm">
                      You've reached the end of the feed.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-slate-600 mb-4 text-6xl">📭</div>
                <h3 className="text-xl font-bold text-white mb-2">No Intelligence Feed Available</h3>
                <p className="text-slate-500">The system is currently fetching fresh data. Please check back in a few minutes.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section - DARK MODE */}
      <section className="bg-slate-900 border-b border-slate-800 w-full">
        <div className="w-full py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 shadow-glow-card">
                <div className="text-4xl font-bold text-blue-400 mb-2">Everyone</div>
                <p className="text-slate-400">is a target for modern scammers</p>
              </div>
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 shadow-glow-critical">
                <div className="text-4xl font-bold text-red-500 mb-2">1 Click</div>
                <p className="text-slate-400">is all it takes to lose data</p>
              </div>
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 shadow-glow-primary">
                <div className="text-4xl font-bold text-emerald-400 mb-2">Simple</div>
                <p className="text-slate-400">steps to stay safe everyday</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Sections */}
      <CategorySection
        title="Data Breaches"
        slug="data-breach"
        icon={Database}
        color="text-blue-400"
      />
      <CategorySection
        title="Malware & Viruses"
        slug="malware"
        icon={FileWarning}
        color="text-red-400"
      />
      <CategorySection
        title="Phishing Alerts"
        slug="phishing"
        icon={Mail}
        color="text-orange-400"
      />

      {/* Newsletter CTA - Compact */}
      <section className="bg-slate-900 border-t border-slate-800 py-8 w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-900/20 to-slate-900 rounded-2xl border border-blue-500/20">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 hidden md:block">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Stay ahead of threats
                </h2>
                <p className="text-slate-400 text-sm">
                  Get critical alerts delivered daily.
                </p>
              </div>
            </div>
            <Link
              to="/subscribe"
              className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors text-sm text-center flex items-center justify-center"
            >
              Start Free Alerts
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}