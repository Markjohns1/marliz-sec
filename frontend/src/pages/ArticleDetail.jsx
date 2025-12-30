import { useQuery } from '@tanstack/react-query';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getArticle, getRelatedArticles } from '../services/api';
import {
  Clock, CheckCircle2, AlertCircle,
  ExternalLink, ChevronLeft, Shield, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import AdUnit from '../components/AdUnit';
import SocialShare from '../components/SocialShare';
import AudioBrief from '../components/AudioBrief';
import config from '../config';

const stripHtml = (html) => {
  if (!html) return '';
  const doc = new Image().ownerDocument.createElement('div');
  doc.innerHTML = html;
  return doc.textContent || doc.innerText || '';
};

export default function ArticleDetail() {
  const { slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticle(slug),
    enabled: !!slug && slug !== 'undefined'
  });

  // Redirect if slug is 'undefined' or follows the broken pattern
  if (slug === 'undefined' || slug.includes('undefined/article/')) {
    return <Navigate to="/" replace />;
  }

  const { data: related } = useQuery({
    queryKey: ['related', article?.id],
    queryFn: () => getRelatedArticles(article.id),
    enabled: !!article?.id
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-slate-200 rounded w-3/4 mb-8"></div>
          <div className="aspect-video bg-slate-200 rounded-xl mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">Article not found.</p>
        <Link to="/" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const threatConfig = {
    low: { badge: 'threat-badge-low', icon: <CheckCircle className="w-4 h-4 mr-2" />, text: 'LOW RISK' },
    medium: { badge: 'threat-badge-medium', icon: <Info className="w-4 h-4 mr-2" />, text: 'MEDIUM RISK' },
    high: { badge: 'threat-badge-high', icon: <AlertTriangle className="w-4 h-4 mr-2" />, text: 'HIGH RISK' },
    critical: { badge: 'threat-badge-critical', icon: <Shield className="w-4 h-4 mr-2" />, text: 'CRITICAL ALERT' }
  };

  const activeThreatConfig = threatConfig[article.simplified?.threat_level || 'medium'];
  const actionSteps = article.simplified?.action_steps
    ? JSON.parse(article.simplified.action_steps)
    : [];

  const publishedDate = article.published_at
    ? format(new Date(article.published_at), 'MMMM d, yyyy')
    : 'Recently';

  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Recently';

  return (
    <>
      <Helmet>
        <title>{article.title} | Marliz Threat Intel</title>
        <meta name="description" content={stripHtml(article.simplified?.friendly_summary || article.meta_description)} />
        <meta name="keywords" content={article.keywords} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={stripHtml(article.simplified?.friendly_summary)} />
        {article.image_url && <meta property="og:image" content={article.image_url} />}
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`${config.CANONICAL_BASE}/article/${article.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "image": article.image_url,
            "datePublished": article.published_at,
            "dateModified": article.updated_at || article.published_at,
            "author": {
              "@type": "Organization",
              "name": "Marliz Sec News"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Marliz Sec News",
              "logo": {
                "@type": "ImageObject",
                "url": "https://yourdomain.com/logo.jpg"
              }
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center text-sm text-slate-400">
              <Link to="/" className="hover:text-blue-400 transition-colors">
                Home
              </Link>
              <span className="mx-2 text-slate-600">/</span>
              {article.category && (
                <>
                  <Link
                    to={`/category/${article.category.slug}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {article.category.name}
                  </Link>
                  <span className="mx-2 text-slate-600">/</span>
                </>
              )}
              <span className="text-slate-200 truncate">{article.title.substring(0, 50)}...</span>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-8 relative items-start">

          {/* LEFT SIDEBAR AD (Desktop Only) */}
          <div className="hidden xl:block w-[160px] shrink-0 sticky top-24 pt-4">
            <AdUnit format="vertical" />
          </div>

          {/* MAIN CONTENT */}
          <article className="flex-1 min-w-0 max-w-4xl mx-auto w-full">
            {/* Back Button */}
            <Link
              to="/"
              className="inline-flex items-center text-slate-400 hover:text-blue-400 mb-8 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Latest Threats
            </Link>

            {/* Threat Level Badge */}
            <div className="mb-6">
              <span className={`${activeThreatConfig.badge} text-base`}>
                {activeThreatConfig.icon} {activeThreatConfig.text}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-800">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {publishedDate} ({timeAgo})
              </div>

              <div className="flex items-center bg-blue-950/40 px-3 py-1 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                <Shield className="w-3.5 h-3.5 mr-2 text-blue-400" />
                <span className="font-semibold text-blue-100">{article.source_name || 'Marliz Sec Staff'}</span>
                <CheckCircle2 className="w-4 h-4 ml-1.5 text-blue-500" fill="currentColor" />
                <span className="hidden sm:inline text-[10px] text-blue-400/80 ml-2 border-l border-blue-500/20 pl-2 uppercase tracking-widest font-bold">Trusted Source</span>
              </div>

              {article.simplified?.reading_time_minutes && (
                <div>
                  {article.simplified.reading_time_minutes} min read
                </div>
              )}

              {article.is_edited && (
                <div className="text-slate-500 italic">
                  Last edited {article.edited_at ? formatDistanceToNow(new Date(article.edited_at), { addSuffix: true }) : 'recently'}
                </div>
              )}

              <div className="ml-auto">
                <SocialShare
                  url={`${config.CANONICAL_BASE}/article/${article.slug}`}
                  title={article.title}
                  summary={article.simplified?.friendly_summary}
                />
              </div>
            </div>

            {/* AI Audio Briefing */}
            <AudioBrief article={article} />

            {/* Featured Image */}
            {article.image_url && (
              <div className="mb-12 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full"
                  loading="lazy"
                />
              </div>
            )}

            {/* Main Content */}
            <div className="prose prose-lg max-w-none">
              {/* Summary */}
              <section className="bg-slate-900/50 rounded-xl p-8 border border-slate-800 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-2 text-blue-500" />
                  Now, Let's Talk About What Happened
                </h2>
                <div
                  className="text-lg text-slate-300 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: article.simplified?.friendly_summary }}
                />
              </section>

              {/* Technical Details - Attack Vector */}
              {article.simplified?.attack_vector && (
                <section className="bg-red-900/10 border-l-4 border-red-500 rounded-r-xl p-8 mb-8">
                  <h2 className="text-2xl font-bold text-red-100 mb-4 flex items-center">
                    <Shield className="w-6 h-6 mr-2 text-red-500" />
                    Technically: How It Happened
                  </h2>
                  <div
                    className="text-lg text-red-100/90 leading-relaxed font-mono text-sm md:text-base space-y-4"
                    dangerouslySetInnerHTML={{
                      __html: article.simplified.attack_vector
                        .replace(/\|\|\|/g, '')
                        .replace(/<h2>.*?<\/h2>/gi, '')
                    }}
                  />
                </section>
              )}

              {/* MOBILE AD PLACEMENT (Visible only on mobile/tablet) */}
              <div className="xl:hidden">
                <AdUnit format="rectangle" />
              </div>

              {/* Business Impact */}
              <section className="bg-blue-900/10 border-l-4 border-blue-500 rounded-r-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-blue-100 mb-4">
                  Why This Matters to You (Personal & Business)
                </h2>
                <div
                  className="text-lg text-blue-200 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: article.simplified?.business_impact?.replace(/\|\|\|/g, '') }}
                />
              </section>

              {/* Action Steps */}
              <section className="bg-slate-900/50 rounded-xl p-8 border border-slate-800 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  What to Do RIGHT NOW to Protect Yourself and your business
                </h2>
                <div className="space-y-4">
                  {actionSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 bg-emerald-900/10 rounded-lg border border-emerald-900/20 hover:border-emerald-500/30 transition-colors"
                    >
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-200 font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECONDARY MOBILE AD */}
              <div className="xl:hidden">
                <AdUnit format="fluid" />
              </div>

              {/* Original Source CTA */}
              {article.original_url && (
                <div className="mt-8 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div>
                    <h3 className="text-white font-bold mb-1">Need the raw technical report?</h3>
                    <p className="text-slate-400 text-sm">
                      Read the full original documentation at the source.
                    </p>
                  </div>
                  <a
                    href={article.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors border border-slate-600 group"
                  >
                    Open Original Source
                    <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              )}
            </div>

            {/* CTA - Minimal & Non-Intrusive */}
            <div className="mt-12 pt-8 border-t border-slate-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/30 rounded-xl p-6 border border-slate-800/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-1">Found this useful?</h3>
                  <p className="text-slate-400 text-sm">
                    Join 2,500+ professionals getting daily threat briefings.
                  </p>
                </div>
                <Link
                  to="/subscribe"
                  className="shrink-0 px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-medium rounded-lg border border-blue-500/20 transition-all text-sm"
                >
                  Get Daily Alerts
                </Link>
              </div>
            </div>
          </article>

          {/* RIGHT SIDEBAR AD (Desktop Only) */}
          <div className="hidden xl:block w-[160px] shrink-0 sticky top-24 pt-4">
            <AdUnit format="vertical" />
          </div>
        </div>

        {/* Related Articles */}
        {related && related.length > 0 && (
          <section className="border-t border-slate-800 py-16">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-white mb-8">Related Threats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {related.map((article) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="card group"
                  >
                    {article.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}