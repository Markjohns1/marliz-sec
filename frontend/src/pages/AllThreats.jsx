import { useInfiniteQuery } from '@tanstack/react-query';
import { getArticles } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Helmet } from 'react-helmet-async';
import { Shield, ChevronDown } from 'lucide-react';

export default function AllThreats() {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['articles', 'archive'],
        queryFn: ({ pageParam = 1 }) => getArticles({ page: pageParam, limit: 12 }),
        getNextPageParam: (lastPage) => {
            return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined;
        }
    });

    const allArticles = data?.pages.flatMap(page => page.articles) || [];

    return (
        <>
            <Helmet>
                <title>Global Threat Index | Marliz Threat Intel</title>
                <meta name="description" content="Access the complete archive of global cybersecurity threats, data breaches, and ransomware alerts analyzed by Marliz Intel." />
            </Helmet>

            <div className="bg-slate-950 min-h-screen">
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
                    ) : allArticles.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {allArticles.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>

                            {/* Pagination/Load More */}
                            <div className="flex justify-center mt-16 pb-12">
                                {hasNextPage ? (
                                    <button
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
                                    >
                                        {isFetchingNextPage ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                                                Scanning Records...
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-5 h-5 mr-2" />
                                                Load More Intelligence
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-slate-500 text-sm italic">
                                        End of Intelligence Index. All verified threats loaded.
                                    </div>
                                )}
                            </div>
                        </>
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
