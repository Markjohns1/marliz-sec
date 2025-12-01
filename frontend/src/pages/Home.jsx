import { useQuery } from '@tanstack/react-query';
import { getArticles } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Shield, TrendingUp, Bell, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', { page: 1, limit: 12 }],
    queryFn: () => getArticles({ page: 1, limit: 12 })
  });

  if (error) {
    return (
      <div className="w-full py-12 text-center px-4"> {/* Changed to w-full and px-4 */}
        <p className="text-red-600">Failed to load articles. Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Marliz Sec - Cybersecurity Threats Simplified for Small Business</title>
        <meta 
          name="description" 
          content="Get the latest cybersecurity news translated into plain English. Protect your small business from ransomware, phishing, and data breaches with actionable advice." 
        />
        <meta name="keywords" content="small business cybersecurity, ransomware protection, phishing prevention, business security news" />
      </Helmet>

      {/* Hero Section - NOW FULL WIDTH */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white w-full">
        <div className="w-full py-16 md:py-24 px-4"> {/* Removed container-custom */}
          <div className="max-w-7xl mx-auto"> {/* Added max-w-7xl for content, but full width background */}
            <div className="inline-flex items-center bg-primary-500/30 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Trusted by 2,500+ Small Businesses</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Cybersecurity News in Plain English
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-100 mb-8 leading-relaxed">
              We translate complex cyber threats into simple, actionable advice for small business owners. No jargon, just what you need to do.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/subscribe" className="bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg inline-flex items-center justify-center">
                <Bell className="w-5 h-5 mr-2" />
                Get Daily Threat Alerts
              </Link>
              <a href="#latest" className="bg-primary-500/30 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-500/40 transition-colors border border-white/20 inline-flex items-center justify-center">
                See Latest Threats
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - NOW FULL WIDTH */}
      <section className="bg-white border-b border-slate-200 w-full">
        <div className="w-full py-12 px-4"> {/* Removed container-custom */}
          <div className="max-w-7xl mx-auto"> {/* Added max-w-7xl for content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div style={{ border: '1px solid blue', borderRadius: '10px', padding: '10px' }}>
                <div className="text-4xl font-bold text-primary-600 mb-2">46%</div>
                <p className="text-slate-600">of cyberattacks target small businesses</p>
              </div>
              <div style={{ border: '1px solid blue', borderRadius: '10px', padding: '10px' }}>
                <div className="text-4xl font-bold text-danger-600 mb-2">60%</div>
                <p className="text-slate-600">close within 6 months after an attack</p>
              </div>
              <div style={{ border: '1px solid blue', borderRadius: '10px', padding: '10px' }}>
                <div className="text-4xl font-bold text-success-600 mb-2">3 min</div>
                <p className="text-slate-600">to understand each threat and take action</p>
              </div>  
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles - NOW FULL WIDTH */}
      <section id="latest" className="py-16 bg-slate-50 w-full">
        <div className="w-full px-4"> {/* Removed container-custom */}
          <div className="max-w-7xl mx-auto"> {/* Added max-w-7xl for content */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Latest Threats</h2>
                <p className="text-slate-600">Updated every 4 hours with actionable insights</p>
              </div>
              
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="bg-slate-200 aspect-video"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded"></div>
                      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : data?.articles?.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {data.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {data.pages > 1 && (
                  <div className="text-center mt-12">
                    <Link 
                      to="/all-threats" 
                      className="btn-secondary inline-flex items-center"
                    >
                      View All {data.total} Threats
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600">No articles available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter CTA - NOW FULL WIDTH */}
      <section className="bg-primary-600 text-white py-16 w-full">
        <div className="w-full px-4 text-center"> {/* Removed container-custom */}
          <div className="max-w-7xl mx-auto"> {/* Added max-w-7xl for content */}
            <Bell className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Never Miss a Critical Threat
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Get simplified security alerts delivered to your inbox. Join 2,500+ smart business owners staying protected.
            </p>
            <Link 
              to="/subscribe" 
              className="bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg inline-flex items-center"
            >
              Start Free Alerts
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}