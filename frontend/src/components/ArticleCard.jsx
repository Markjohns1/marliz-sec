import { Link } from 'react-router-dom';
import { Clock, TrendingUp, AlertCircle, Shield, AlertTriangle, CheckCircle, Info, Eye, Users, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const stripHtml = (html) => {
  return (html || '').replace(/<[^>]+>/g, '');
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
    <article className="card group flex flex-col h-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300">
      <div className="aspect-video overflow-hidden relative overflow-hidden group-hover:shadow-2xl transition-all duration-300">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br ${config.grad} border-b`}>
            {/* Abstract Tech Pattern */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

            <div className="relative z-10 text-center transform group-hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-sm mb-3 border border-white/10 shadow-lg">
                <div className="text-white/80 scale-150">{config.icon}</div>
              </div>
              <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm md:text-base opacity-90 drop-shadow-md">
                {article.category?.name || 'Security Brief'}
              </h3>
              <div className="mt-2 inline-block px-3 py-1 rounded-full border border-white/10 bg-black/20 backdrop-blur-md">
                <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest">{config.text}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className={config.badge}>
            {config.icon} {config.text}
          </span>

          {/* View Count - Social Proof */}
          <span className="flex items-center text-xs text-slate-400">
            <Eye className="w-3 h-3 mr-1" />
            {viewText}
          </span>
        </div>

        <Link to={`/article/${article.slug}`}>
          <h3 className="text-lg md:text-xl font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {article.simplified?.friendly_summary && (
          <p className="text-slate-400 mb-4 line-clamp-2 leading-relaxed text-sm flex-1">
            {stripHtml(article.simplified.friendly_summary)}
          </p>
        )}

        {/* Impact Brief - Dossier Style */}
        {article.simplified?.business_impact && (
          <div className="mb-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 backdrop-blur-sm">
            <div className="flex items-start text-[11px] text-blue-300 font-mono uppercase tracking-wider leading-relaxed">
              <Shield className="w-3.5 h-3.5 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
              <span className="line-clamp-2">IMPACT: {stripHtml(article.simplified.business_impact)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-700 mt-auto">
          <div className="flex items-center text-sm text-slate-500">
            <Clock className="w-4 h-4 mr-1" />
            {timeAgo}
          </div>

          <Link
            to={`/article/${article.slug}`}
            className="text-blue-500 hover:text-blue-400 font-bold text-xs uppercase tracking-[0.2em] flex items-center group/btn"
          >
            Analyze Intelligence
            <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}