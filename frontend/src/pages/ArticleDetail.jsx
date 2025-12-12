import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getArticle, getRelatedArticles } from '../services/api';
import {
  Clock, Share2, CheckCircle2, AlertCircle,
  ExternalLink, ChevronLeft, Shield, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Helmet } from 'react-helmet-async';

export default function ArticleDetail() {
  const { slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticle(slug)
  });

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

  const config = threatConfig[article.simplified?.threat_level || 'medium'];
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
        <meta name="description" content={article.simplified?.friendly_summary || article.meta_description} />
        <meta name="keywords" content={article.keywords} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.simplified?.friendly_summary} />
        {article.image_url && <meta property="og:image" content={article.image_url} />}
        <meta property="og:type" content="article" />
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

        <article className="max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
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
              <span className={`${config.badge} text-base`}>
                {config.icon} {config.text}
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

              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                {article.source_name || 'Marliz Sec Staff'}
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

              <button
                onClick={async () => {
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: article.title,
                        text: article.simplified?.friendly_summary,
                        url: window.location.href,
                      });
                    } else {
                      await navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  } catch (err) {
                    console.error('Error sharing:', err);
                  }
                }}
                className="ml-auto flex items-center text-blue-400 hover:text-blue-300 font-medium"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>

            {/* Featured Image */}
            {article.image_url && (
              <div className="mb-12 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full"
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
                <p className="text-lg text-slate-300 leading-relaxed">
                  {article.simplified?.friendly_summary}
                </p>
              </section>

              {/* Business Impact */}
              <section className="bg-blue-900/10 border-l-4 border-blue-500 rounded-r-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-blue-100 mb-4">
                  Why This Matters to You (Personal & Business)
                </h2>
                <p className="text-lg text-blue-200 leading-relaxed">
                  {article.simplified?.business_impact}
                </p>
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

              {/* Original Source */}
              {article.original_url && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
                  <p className="text-sm text-slate-400 mb-2">
                    Want more technical details?
                  </p>
                  <a
                    href={article.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Read the original report
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-8 text-white mt-12 shadow-glow-primary">
              <h3 className="text-2xl font-bold mb-3">Stay Protected</h3>
              <p className="text-blue-100 mb-6">
                Get alerts like this delivered to your inbox every morning. Free, no spam.
              </p>
              <Link
                to="/subscribe"
                className="bg-white text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors inline-block"
              >
                Subscribe to Daily Alerts
              </Link>
            </div>
          </div>
        </article>

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