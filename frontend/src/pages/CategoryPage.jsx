import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getArticles, getCategory } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Helmet } from 'react-helmet-async';
import config from '../config';

export default function CategoryPage() {
  const { slug } = useParams();

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => getCategory(slug)
  });

  const { data, isLoading: articlesLoading } = useQuery({
    queryKey: ['articles', { category: slug, limit: 12 }],
    queryFn: () => getArticles({ category: slug, limit: 12 })
  });

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Category Not Found</h1>
          <p className="text-slate-600 mt-2">The category you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} Security News | {config.SITE_NAME}</title>
        <meta name="description" content={category.description} />
        <link rel="canonical" href={`${config.CANONICAL_BASE}/category/${slug}`} />
      </Helmet>

      <div className="bg-slate-950 min-h-screen">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center mb-4">
              <span className="text-5xl mr-4">{category.icon}</span>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  {category.name}
                </h1>
                <p className="text-lg text-slate-400 mt-2">
                  {category.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="bg-slate-200 aspect-video"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded"></div>
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
              <p className="text-slate-600">No articles in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}