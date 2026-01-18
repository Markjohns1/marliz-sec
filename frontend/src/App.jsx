import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { getCategories } from './services/api';

// CSS IMPORTS ADDED HERE
import './index.css';
import './App.css';

import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import CategoryPage from './pages/CategoryPage';
import Subscribe from './pages/Subscribe';
import About from './pages/About';
import AllThreats from './pages/AllThreats';
import SearchResults from './pages/SearchResults';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import Glossary from './pages/Glossary';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const apiKey = localStorage.getItem('admin_api_key');
  if (!apiKey) {
    return <Navigate to="/console/login" replace />;
  }
  return children;
};

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/console');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {!isAdminPath && <Header categories={categories} />}
      <main className={`flex-grow ${!isAdminPath ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/all-threats" element={<AllThreats />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/article/:slug" element={<ArticleDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/glossary" element={<Glossary />} />
          {/* Admin Routes (Obfuscated) */}
          <Route path="/console/login" element={<AdminLogin />} />
          <Route
            path="/console"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Trap for broken 'undefined' links from old bugs */}
          <Route path="*/undefined/*" element={
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
              <h1 className="text-6xl font-black text-slate-800 mb-4">410</h1>
              <h2 className="text-2xl font-bold text-white mb-2">Content Permanently Removed</h2>
              <p className="text-slate-400">The link you followed is broken and has been removed.</p>
            </div>
          } />

          {/* Catch-all route for broken/undefined links */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminPath && (
        <>
          <Footer categories={categories} />
          <BottomNav />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}