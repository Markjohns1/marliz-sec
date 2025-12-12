import { useQuery } from '@tanstack/react-query';
import { getArticles } from '../services/api';
import ArticleCard from './ArticleCard';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield, AlertTriangle, FileWarning, Database } from 'lucide-react';

export default function CategorySection({ title, slug, icon: Icon, color = 'text-primary-600' }) {
    const { data, isLoading } = useQuery({
        queryKey: ['articles', { category: slug, limit: 3 }],
        queryFn: () => getArticles({ category: slug, limit: 3 })
    });

    // Don't render empty sections
    if (!isLoading && (!data?.articles || data.articles.length === 0)) {
        return null;
    }

    return (
        <section className="py-12 border-b border-slate-800">
            <div className="w-full px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <span className={`p-2 rounded-lg bg-slate-800 mr-3 border border-slate-700 ${color}`}>
                                <Icon className="w-6 h-6" />
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
                        </div>
                        <Link
                            to={`/category/${slug}`}
                            className="text-blue-400 font-bold hover:text-blue-300 flex items-center text-sm md:text-base transition-colors"
                        >
                            See All
                            <ChevronRight className="w-5 h-5 ml-1" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="bg-slate-200 aspect-video"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {data.articles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
