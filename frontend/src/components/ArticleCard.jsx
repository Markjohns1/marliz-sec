import { Link } from 'react-router-dom';
import { Clock, TrendingUp, AlertCircle, Shield, AlertTriangle, CheckCircle, Info, Eye, Users, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const stripHtml = (html) => {
  return (html || '')
    .replace(/<[^>]+>/g, '')         // Remove HTML
    .replace(/^#+\s*/gm, '')         // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1')     // Remove italics
    .replace(/__(.*?)__/g, '$1')     // Remove bold alt
    .replace(/_(.*?)_/g, '$1')       // Remove italics alt
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links but keep text
    .replace(/!\[.*?\]\(.*?\)/g, '')    // Remove images
    .replace(/`{1,3}.*?`{1,3}/g, '')   // Remove code
    .replace(/>\s*(.*)/gm, '$1')     // Remove blockquotes
    .replace(/#+/g, '')              // Remove stray hashtags
    .trim();
};

const getLevelColor = (level) => {
  switch (level) {
    case 'critical': return 'bg-red-600 shadow-glow-critical';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-emerald-600';
    case 'low': return 'bg-blue-500';
    default: return 'bg-slate-500';
  }
};

export default function ArticleCard({ article }) {
  const threatLevelConfig = {
    low: {
      badge: 'threat-badge-low',
      icon: <Info className="w-3.5 h-3.5" />,
      text: 'LOW RISK',
      grad: 'from-blue-950 to-slate-900 border-blue-900/30'
    },
    medium: {
      badge: 'threat-badge-medium',
      icon: <Shield className="w-3.5 h-3.5" />,
      text: 'MEDIUM RISK',
      grad: 'from-emerald-950 to-slate-900 border-emerald-900/30'
    },
    high: {
      badge: 'threat-badge-high',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      text: 'HIGH RISK',
      grad: 'from-orange-950 to-slate-900 border-orange-900/30'
    },
    critical: {
      badge: 'threat-badge-critical',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      text: 'CRITICAL',
      grad: 'from-red-950 to-red-900 border-red-900/30'
    }
  };

  const config = threatLevelConfig[article.simplified?.threat_level?.toLowerCase() || 'medium'];
  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Recently';

  // View count (show at least 1 for social proof)
  const viewCount = Math.max(article.views || 0, 1);
  const viewText = viewCount === 1 ? '1 view' : `${viewCount.toLocaleString()} views`;

  return (
    <article className="card group flex flex-col h-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">

      {/* Image Section with Overlays */}
      <div className="aspect-video relative overflow-hidden">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${config.grad}`}>
            <span className="text-white/20 text-6xl font-black">{config.icon}</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>

      </div>

      {/* Meta Bar - Dark Strip */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center text-[11px] text-slate-400 font-medium">
          <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
          {viewText}
        </div>
        <div className="flex items-center text-[11px] text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
          {timeAgo}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col pt-4 relative z-10 bg-slate-900">

        {/* Badges Row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-700 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded bg-slate-800/50">
            {article.category?.name || 'INTEL'}
          </span>
          <span className={`${getLevelColor(article.simplified?.threat_level?.toLowerCase())} text-white text-[8px] md:text-[10px] font-black px-1.5 py-0.5 md:px-3 md:py-1.5 rounded shadow-lg uppercase tracking-wider flex items-center gap-1.5 md:gap-2 transform hover:scale-105 transition-transform`}>
            {config.icon}
            <span>{config.text}</span>
          </span>
        </div>

        <Link to={`/article/${article.slug}`}>
          <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors leading-tight filter drop-shadow-sm">
            {article.title}
          </h3>
        </Link>

        {/* Executive Summary Section */}
        {article.simplified?.friendly_summary && (
          <div className="flex-1">
            <div className="inline-block px-2 py-0.5 rounded-md bg-blue-900/20 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-3">
              Executive Summary
            </div>
            <p className="text-slate-400 mb-6 line-clamp-3 text-sm leading-relaxed font-light">
              {stripHtml(article.simplified.friendly_summary)}
            </p>
          </div>
        )}

        {/* Minimal Footer Link */}
        <div className="mt-auto border-t border-slate-800/50 pt-4 flex justify-end">
          <Link
            to={`/article/${article.slug}`}
            className="text-blue-400 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center transition-colors group/link"
          >
            Read More
            <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article >
  );
}
