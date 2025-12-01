import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getArticles, getCategory } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Helmet } from 'react-helmet-async';

export default function CategoryPage() {
  const { slug } = useParams();

  const { data: category } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => getCategory(slug)
  });

  const { data, isLoading } = useQuery({
    queryKey: ['articles', { category: slug, limit: 12 }],
    queryFn: () => getArticles({ category: slug, limit: 12 })
  });

  return (
    <>
      <Helmet>
        <title>{category?.name} Security News | Marliz Sec</title>
        <meta name="description" content={category?.description} />
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="container-custom py-12">
            <div className="flex items-center mb-4">
              <span className="text-5xl mr-4">{category?.icon}</span>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">
                  {category?.name}
                </h1>
                <p className="text-lg text-slate-600 mt-2">
                  {category?.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="container-custom py-12">
          {isLoading ? (
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