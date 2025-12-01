import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Bell } from 'lucide-react';

export default function Header({ categories }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm w-full">
      <nav className="w-full">
        <div className="flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center space-x-2 group">
  <div className="p-2 rounded-lg transition-colors"> {/* REMOVED group-hover:bg-primary-700 */}
    <img 
      src="/logo.jpg" 
      alt="Marliz Sec" 
      className="w-10 h-10 rounded-full"
    />
  </div>
  <div className="hidden sm:block">
    <span className="text-xl font-bold text-slate-900">Marliz Sec</span>
    <span className="text-sm text-slate-500 block leading-none"></span>
  </div>
</Link>

          <div className="hidden md:flex items-center space-x-8 ml-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-slate-700 hover:text-primary-600'
              }`}
            >
              Latest
            </Link>
            
            {categories?.slice(0, 4).map((cat) => (
              <Link 
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={`font-medium transition-colors ${
                  isActive(`/category/${cat.slug}`)
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-slate-700 hover:text-primary-600'
                }`}
              >
                {cat.name}
              </Link>
            ))}
            
            <Link 
              to="/about" 
              className={`font-medium transition-colors ${
                isActive('/about') 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-slate-700 hover:text-primary-600'
              }`}
            >
              About
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="text-slate-700 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-slate-100">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/subscribe" className="btn-primary text-sm px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">
              Get Alerts
            </Link>
          </div>

          <button 
            className="md:hidden text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 animate-fadeIn bg-white w-full">
            <div className="flex flex-col space-y-4 px-4">
              <Link 
                to="/" 
                className={`py-2 font-medium transition-colors text-left ${
                  isActive('/') ? 'text-primary-600 bg-primary-50' : 'text-slate-700 hover:text-primary-600 hover:bg-slate-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Latest Threats
              </Link>
              
              {categories?.map((cat) => (
                <Link 
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className={`py-2 font-medium transition-colors text-left ${
                    isActive(`/category/${cat.slug}`) ? 'text-primary-600 bg-primary-50' : 'text-slate-700 hover:text-primary-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              
              <Link 
                to="/about" 
                className={`py-2 font-medium transition-colors text-left ${
                  isActive('/about') ? 'text-primary-600 bg-primary-50' : 'text-slate-700 hover:text-primary-600 hover:bg-slate-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              
              <div className="pt-6 pb-2 border-t border-slate-200 bg-primary-50/50 -mx-4 px-4">
                <p className="text-sm font-semibold text-primary-700 mb-3 text-center">
                  Stay Protected
                </p>
                <Link 
                  to="/subscribe" 
                  className="btn-primary w-full text-center py-4 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors font-semibold shadow-md flex items-center justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bell className="w-5 h-5 mr-2" />
                  Subscribe to Alerts
                </Link>
                <p className="text-xs text-primary-600 text-center mt-2">
                  Join 2,500+ protected businesses
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}