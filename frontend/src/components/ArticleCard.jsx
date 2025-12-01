import { Link } from 'react-router-dom';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ArticleCard({ article }) {
  const threatLevelConfig = {
    low: {
      badge: 'threat-badge-low',
      icon: '🟢',
      text: 'LOW RISK'
    },
    medium: {
      badge: 'threat-badge-medium',
      icon: '🟡',
      text: 'MEDIUM RISK'
    },
    high: {
      badge: 'threat-badge-high',
      icon: '🔴',
      text: 'HIGH RISK'
    },
    critical: {
      badge: 'threat-badge-critical',
      icon: '🚨',
      text: 'CRITICAL'
    }
  };

  const config = threatLevelConfig[article.simplified?.threat_level || 'medium'];
  const timeAgo = article.published_at 
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Recently';

  return (
    <article className="card group">
      {article.image_url && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={article.image_url} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className={config.badge}>
            {config.icon} {config.text}
          </span>
          
          {article.category && (
            <span className="text-xs font-medium text-slate-500">
              {article.category.icon} {article.category.name}
            </span>
          )}
        </div>

        <Link to={`/article/${article.slug}`}>
          <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {article.simplified?.friendly_summary && (
          <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">
            {article.simplified.friendly_summary}
          </p>
        )}

        {article.simplified?.business_impact && (
          <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary-900 mb-1">
                  What This Means for You
                </p>
                <p className="text-sm text-primary-800 line-clamp-2">
                  {article.simplified.business_impact}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center text-sm text-slate-500">
            <Clock className="w-4 h-4 mr-1" />
            {timeAgo}
          </div>
          
          <Link 
            to={`/article/${article.slug}`}
            className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center group"
          >
            Read Full Alert
            <TrendingUp className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {article.views > 0 && (
          <div className="mt-2 text-xs text-slate-400">
            {article.views.toLocaleString()} views
          </div>
        )}
      </div>
    </article>
  );
}