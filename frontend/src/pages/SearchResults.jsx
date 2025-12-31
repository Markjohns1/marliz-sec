import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getArticles } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import QuickSearch from '../components/QuickSearch';
import { Search, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['articles', { search: query }],
        queryFn: () => getArticles({ search: query, limit: 12 }),
        enabled: !!query,
    });

    useEffect(() => {
        if (query) {
            refetch();
        }
    }, [query, refetch]);

    if (!query) {
        return (
            <div className="container-custom py-12 text-center min-h-[50vh] flex flex-col items-center justify-center">
                <Search className="w-16 h-16 text-slate-700 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Search for Threats</h2>
                <p className="text-slate-400">Enter a keyword to find specific threat intelligence.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            <div className="bg-slate-900 border-b border-slate-800 py-12">
                <div className="container-custom text-center">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter">
                        Search Results
                    </h1>
                    <p className="text-slate-400 text-lg mb-8">
                        Showing results for <span className="text-blue-400 font-bold">"{query}"</span>
                    </p>
                    <div className="max-w-xl mx-auto">
                        <QuickSearch
                            placeholder="Search another threat..."
                            initialValue={query}
                            liveResults={true}
                        />
                    </div>
                </div>
            </div>

            <div className="container-custom py-12">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="card animate-pulse h-96">
                                <div className="bg-slate-800 h-48 w-full"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                                    <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-800 rounded w-full"></div>
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
                    <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <Search className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No threats found</h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                            We couldn't find any intelligence matching <strong>"{query}"</strong>.
                            Try broader keywords like "ransomware" or "phishing".
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
