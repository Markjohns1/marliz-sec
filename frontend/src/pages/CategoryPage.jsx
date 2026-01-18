import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getArticles, getCategory } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';
import config from '../config';


const SEO_DESCRIPTIONS = {
  "data-breach": "Comprehensive monitoring of global data breaches, focusing on unauthorized access to Personally Identifiable Information (PII), corporate trade secrets, and government databases. We track leaks from the initial dark web sale to the final public disclosure.",
  "ransomware": "Real-time intelligence on active ransomware campaigns, double-extortion tactics, and ransomware-as-a-service (RaaS) groups. Our analysis covers encryption methods, ransom demands, and decryption availability for major families.",
  "vulnerability": "Critical alerts on Zero-Day exploits (0-day) and Common Vulnerabilities and Exposures (CVEs). We prioritize patch management intelligence, detailing proof-of-concept (PoC) exploits and active wild exploitation.",
  "phishing": "Deep dives into advanced social engineering campaigns, Business Email Compromise (BEC), and credential harvesting attacks. We analyze current phishing lures and malicious attachments targeting corporate inboxes.",
  "malware": "Technical breakdown of emerging malware strains, including banking trojans, spyware, info-stealers, and botnets. We provide indicators of compromise (IoCs) and C2 infrastructure tracking.",
  "general": "Broad spectrum cybersecurity news covering industry trends, regulatory shifts, and fundamental security practices for risk management."
};

export default function CategoryPage() {
  const { slug } = useParams();
  const seoDescription = SEO_DESCRIPTIONS[slug];

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => getCategory(slug)
  });

  const {
    data,
    isLoading: articlesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['articles', 'category', slug],
    queryFn: ({ pageParam = 1 }) => getArticles({ category: slug, page: pageParam, limit: 12 }),
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined;
    },
    enabled: !!slug
  });

  const allArticles = data?.pages.flatMap(page => page.articles) || [];

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Category Not Found</h1>
          <p className="text-slate-400 mt-2">The category you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} Security News | {config.SITE_NAME}</title>
        <meta name="description" content={seoDescription || category.description} />
        <link rel="canonical" href={`${config.CANONICAL_BASE}/category/${slug}`} />
      </Helmet>

      <div className="bg-slate-950 min-h-screen">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center mb-4">
              <span className="text-5xl mr-4">{category.icon}</span>
              <div>
                <h1 className="text-4xl font-black text-white">
                  {category.name}
                </h1>
                <p className="text-lg text-slate-400 mt-2">
                  {seoDescription || category.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {articlesLoading && allArticles.length === 0 ? (
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

              {/* Pagination */}
              <div className="flex justify-center mt-16 pb-12">
                {hasNextPage ? (
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
                  >
                    {isFetchingNextPage ? (
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                    ) : (
                      <ChevronDown className="w-5 h-5 mr-2" />
                    )}
                    Load More {category.name}
                  </button>
                ) : (
                  <div className="text-slate-500 text-sm italic">
                    All {category.name} intelligence loaded.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">No articles in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
