import { Link } from 'react-router-dom';
import { Clock, TrendingUp, AlertCircle, Shield, AlertTriangle, CheckCircle, Info, Eye, Users, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const stripHtml = (html) => {
  return (html || '').replace(/<[^>]+>/g, '');
};

const getLevelColor = (level) => {
  switch (level) {
    case 'critical': return 'bg-red-500 shadow-glow-critical';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-blue-500';
    case 'low': return 'bg-emerald-500';
    default: return 'bg-slate-500';
  }
};

export default function ArticleCard({ article }) {
  const threatLevelConfig = {
    low: {
      badge: 'threat-badge-low',
      icon: <CheckCircle className="w-4 h-4" />,
      text: 'LOW RISK',
      grad: 'from-emerald-950 to-slate-900 border-emerald-900/30'
    },
    medium: {
      badge: 'threat-badge-medium',
      icon: <Info className="w-4 h-4" />,
      text: 'MEDIUM RISK',
      grad: 'from-blue-950 to-slate-900 border-blue-900/30'
    },
    high: {
      badge: 'threat-badge-high',
      icon: <AlertTriangle className="w-4 h-4" />,
      text: 'HIGH RISK',
      grad: 'from-orange-950 to-slate-900 border-orange-900/30'
    },
    critical: {
      badge: 'threat-badge-critical',
      icon: <Shield className="w-4 h-4" />,
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

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-bold px-2 py-1 rounded border border-slate-700 uppercase tracking-wider">
            {article.category?.name || 'INTEL'}
          </span>
          <span className={`${getLevelColor(article.simplified?.threat_level?.toLowerCase())} text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider flex items-center gap-1`}>
            {config.icon} {config.text}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col pt-2 relative z-10 -mt-8">
        <Link to={`/article/${article.slug}`}>
          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-tight line-clamp-3 filter drop-shadow-lg">
            {article.title}
          </h3>
        </Link>

        {article.simplified?.friendly_summary && (
          <p className="text-slate-400 mb-6 line-clamp-3 text-sm leading-relaxed flex-1 font-light border-l-2 border-slate-800 pl-3">
            {stripHtml(article.simplified.friendly_summary)}
          </p>
        )}

        {/* Minimal Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
          <div className="flex items-center text-xs text-slate-500 font-mono">
            <Clock className="w-3 h-3 mr-1.5" />
            {timeAgo}
          </div>

          <Link
            to={`/article/${article.slug}`}
            className="text-blue-400 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center transition-colors"
          >
            Details
            <ChevronRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
