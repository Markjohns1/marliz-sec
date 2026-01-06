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
                {/* Header */}
                <div className="bg-slate-900 border-b border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
                        <span className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-3 block">
                            Intelligence Archive
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                            Global Threat Index
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed border-l-2 border-slate-700 pl-4">
                            Comprehensive list of all analyzed cybersecurity threats affecting the global landscape.
                        </p>
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
