import { useQuery } from '@tanstack/react-query';
import { getArticles } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';

export default function AllThreats() {
    const { data, isLoading } = useQuery({
        queryKey: ['articles', { limit: 50 }],
        queryFn: () => getArticles({ limit: 50 })
    });

    return (
        <>
            <Helmet>
                <title>All Active Threats | Marliz Threat Intel</title>
                <meta name="description" content="Browse the complete database of simplified cybersecurity threats affecting East African businesses." />
            </Helmet>

            <div className="bg-slate-950 min-h-screen">
                {/* Header */}
                <div className="bg-slate-900 border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 py-12">
                        <div className="flex items-center mb-4">
                            <span className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg mr-4">
                                <Shield className="w-8 h-8 text-red-500" />
                            </span>
                            <div>
                                <h1 className="text-4xl font-bold text-white">
                                    Global Threat Index
                                </h1>
                                <p className="text-lg text-slate-400 mt-2">
                                    Comprehensive list of all analyzed cybersecurity threats.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Articles */}
                <div className="max-w-7xl mx-auto px-4 py-12">
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
                    ) : data?.articles?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {data.articles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-600">No threats recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
