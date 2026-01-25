import { useQuery } from '@tanstack/react-query';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getArticle, getRelatedArticles } from '../services/api';
import {
  Clock, CheckCircle2, AlertCircle, Calendar, Timer,
  ExternalLink, ChevronLeft, Shield, AlertTriangle, CheckCircle, Info, Zap, Eye
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Helmet } from 'react-helmet-async';
import AdUnit from '../components/AdUnit';
import SocialShare from '../components/SocialShare';
import config from '../config';

const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')   // Remove HTML
    .replace(/^#+\s*/gm, '')    // Remove Markdown headers at start of lines
    .replace(/#+/g, '')         // Remove any stray hashtags
    .replace(/&nbsp;/g, ' ')
    .trim();
};

const formatAIContent = (text) => {
  if (!text) return '';

  // 1. ARCHITECTURAL CLEANING: Convert raw text into structured layout blocks
  let blocks = text
    .replace(/([.!?])\s*([\*•\d+\.])\s+/g, '$1\n\n* ') // Break buried points
    .replace(/(\w)\s+([\*•\d+\.])\s+/g, '$1\n\n* ')   // Break buried points
    .replace(/^[•\d+\.]\s+/gm, '* ')                 // Standardize all bullets to '*'
    .replace(/\|\|\|/g, '')                          // Remove old separators
    .split('\n');

  // 2. PREMIUM RENDERING: Hierarchy, Scannability, and Contrast
  return blocks.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';

    // Logic: If it starts with # (even if mashed) OR meets our "Premium" header criteria
    let isHeader = false;
    let cleanHeader = '';
    let mashedText = '';

    if (trimmed.startsWith('#')) {
      isHeader = true;
      // Extract header part and possible mashed text part
      const hashMatch = trimmed.match(/^(#+)\s*(.*)/);
      if (hashMatch) {
        const content = hashMatch[2];
        // Search for the first sentence end if it's very long (likely mashed)
        const firstPeriod = content.indexOf('. ');
        if (content.length > 85 && firstPeriod !== -1 && firstPeriod < 100) {
          cleanHeader = content.substring(0, firstPeriod).replace(/[#*]/g, '').trim();
          mashedText = content.substring(firstPeriod + 1).trim();
        } else {
          cleanHeader = content.replace(/[#*]/g, '').trim();
        }
      }
    } else if (trimmed.length > 2 && trimmed.length < 85 && !trimmed.endsWith('.') && !trimmed.includes('*') && /^[A-Z0-9]/.test(trimmed)) {
      isHeader = true;
      cleanHeader = trimmed.replace(/\*/g, '').trim();
    }

    if (isHeader && cleanHeader) {
      // Design: Use H3 with extra vertical breathing room
      const headerMarkdown = `\n\n### ${cleanHeader}\n`;
      return mashedText ? `${headerMarkdown}\n${mashedText}` : headerMarkdown;
    }

    // Logic: Key-Value style paragraphs for scannability (Replacing Bullets)
    if (trimmed.startsWith('*')) {
      let content = trimmed.replace(/^\*\s*/, '').trim();

      // If it has a colon, bold the Label
      if (content.includes(': ')) {
        const parts = content.split(': ');
        const key = parts[0].trim();
        const value = parts.slice(1).join(': ').trim();
        return `**${key}:** ${value}`;
      }

      // Bold the first 3 words for scannability
      const words = content.split(' ');
      if (words.length > 5) {
        const lead = words.slice(0, 3).join(' ');
        const rest = words.slice(3).join(' ');
        return `**${lead}** ${rest}`;
      }

      return content;
    }

    return line;
  })
    .filter(line => line.trim() !== '') // CRITICAL: Remove empty lines to prevent "Space Eating"
    .join('\n\n')
    .trim();
};

export default function ArticleDetail() {
  const { slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticle(slug),
    enabled: !!slug && slug !== 'undefined'
  });

  // Redirect if slug is 'undefined' or follows the broken pattern (legacy SEO issue)
  if (!slug || slug === 'undefined' || slug.includes('undefined')) {
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

        {/* News Article Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${config.CANONICAL_BASE}/article/${article.slug}`
            },
            "headline": article.title,
            "description": stripHtml(article.simplified?.friendly_summary || article.meta_description),
            "image": article.image_url || `${config.CANONICAL_BASE}/logo192.png`,
            "datePublished": article.published_at,
            "dateModified": article.updated_at || article.published_at,
            "author": {
              "@type": "Organization",
              "name": "Marliz Intel Bureau",
              "url": config.CANONICAL_BASE
            },
            "publisher": {
              "@type": "Organization",
              "name": "Marliz Intel",
              "logo": {
                "@type": "ImageObject",
                "url": `${config.CANONICAL_BASE}/logo.png`
              }
            }
          })}
        </script>

        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": config.CANONICAL_BASE
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": article.category?.name || "Intelligence",
                "item": `${config.CANONICAL_BASE}/category/${article.category?.slug}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": article.title,
                "item": `${config.CANONICAL_BASE}/article/${article.slug}`
              }
            ]
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

            {/* HEADER SECTION (Above Image) */}
            <div className="mb-8">
              {/* Badges */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-700 px-2.5 py-1 rounded bg-slate-800/50">
                  {article.category?.name || 'INTEL'}
                </span>
                <span className={`${activeThreatConfig.badge} text-[10px] uppercase font-black px-2.5 py-1 flex items-center gap-2`}>
                  {activeThreatConfig.icon} {activeThreatConfig.text}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                {article.title}
              </h1>

              {/* Meta Row */}
              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-6">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                  {publishedDate}
                </div>

                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-slate-500" />
                  {article.views?.toLocaleString() || '1'} views
                </div>

                {article.simplified?.reading_time_minutes && (
                  <div className="flex items-center">
                    <Timer className="w-4 h-4 mr-2 text-slate-500" />
                    {article.simplified.reading_time_minutes} min read
                  </div>
                )}
              </div>

              {/* Social Share Row */}
              <div className="mb-8">
                <SocialShare
                  url={`${config.CANONICAL_BASE}/article/${article.slug}`}
                  title={article.title}
                  summary={stripHtml(article.simplified?.friendly_summary)}
                  showLabel={false}
                />
              </div>
            </div>


            {/* Featured Image */}
            {article.image_url && (
              <div className="mb-12 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
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
              <section className="mb-12">
                <div className="inline-block px-2 py-0.5 rounded-md bg-blue-900/20 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                  Executive Summary
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  What You Need to Know Right Now
                </h2>
                <div className="prose prose-invert prose-blue max-w-none text-lg text-slate-300 leading-relaxed font-light">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {formatAIContent(article.simplified?.friendly_summary)}
                  </ReactMarkdown>
                </div>
              </section>

              {/* Technical Details - Attack Vector */}
              {article.simplified?.attack_vector && (
                <section className="mb-12 p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                  <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center">
                    <div className="p-2 bg-slate-800 rounded-lg mr-3 border border-slate-700">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    Technical Analysis & Mechanics
                  </h2>
                  <div className="prose prose-invert prose-blue max-w-none text-slate-300 leading-relaxed text-base">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {formatAIContent(article.simplified?.attack_vector)}
                    </ReactMarkdown>
                  </div>
                </section>
              )}

              {/* MOBILE AD PLACEMENT (Visible only on mobile/tablet) */}
              <div className="xl:hidden">
                <AdUnit format="rectangle" />
              </div>

              {/* Business Impact */}
              <section className="mb-12 p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center">
                  <div className="p-2 bg-slate-800 rounded-lg mr-3 border border-slate-700">
                    <Shield className="w-5 h-5 text-red-400" />
                  </div>
                  Business & Operational Impact
                </h2>
                <div className="prose prose-invert prose-blue max-w-none text-slate-300 leading-relaxed text-base">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {formatAIContent(article.simplified?.business_impact)}
                  </ReactMarkdown>
                </div>
              </section>

              {/* Action Steps */}
              <section className="bg-slate-900/50 rounded-xl p-8 border border-slate-800 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  What to Do RIGHT NOW to Protect Yourself and your business
                </h2>
                <div className="space-y-4">
                  {/* Handle if actionSteps is an Array of Strings (Old format) */}
                  {Array.isArray(actionSteps) && actionSteps.every(s => typeof s === 'string') && actionSteps.map((step, index) => (
                    <div
                      key={index}
                      className="p-5 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors mb-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-1.5 bg-emerald-500/10 rounded-full text-emerald-500 border border-emerald-500/10">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="px-2 py-0.5 bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase tracking-widest">
                          Recommended
                        </div>
                      </div>
                      <p className="text-slate-200 font-medium leading-relaxed pl-1">
                        {step}
                      </p>
                    </div>
                  ))}

                  {/* Handle if actionSteps is an Object/Dict (New categorized format) */}
                  {!Array.isArray(actionSteps) && typeof actionSteps === 'object' && Object.entries(actionSteps).map(([key, value], index) => (
                    <div key={index} className="flex items-start p-4 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:border-emerald-500/30 transition-colors mb-4 last:mb-0">
                      <div className="mt-0.5 mr-4 p-1 bg-emerald-500/10 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-1">
                          {key.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-slate-200 font-medium leading-relaxed">{value}</p>
                      </div>
                    </div>
                  ))}

                  {/* Handle Empty State */}
                  {(!actionSteps || (Array.isArray(actionSteps) && actionSteps.length === 0)) && (
                    <p className="text-slate-500 italic">No specific action steps provided for this report.</p>
                  )}
                </div>
              </section>

              {/* SECONDARY MOBILE AD */}
              <div className="xl:hidden">
                <AdUnit format="fluid" />
              </div>

              {/* Original Source CTA */}
              <div className="mt-8 mb-12 flex justify-center">
                {article.original_url && !article.original_url.includes('marlizintel.com') && !article.original_url.includes('yourdomain.com') ? (
                  <a
                    href={article.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                  >
                    Open Original Source
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                ) : (
                  <div className="inline-flex items-center px-6 py-3 bg-slate-800/50 text-slate-400 font-bold rounded-lg border border-slate-700/50 shadow-inner">
                    <Shield className="w-4 h-4 mr-2 text-blue-500/50" />
                    Marliz Intel Original Report
                  </div>
                )}
              </div>
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