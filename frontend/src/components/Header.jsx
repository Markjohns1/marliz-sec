import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, Shield, Activity } from 'lucide-react';

export default function Header({ categories }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'submit') {
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-slate-900 border-b border-slate-800 fixed top-0 left-0 right-0 z-50 shadow-lg w-full">
      <nav className="w-full">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-red-600 rounded-lg group-hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">Marliz<span className="text-red-500">Intel</span></span>
              <span className="text-xs text-slate-400 font-mono tracking-wider">CYBER SECURITY FOR EVERYONE</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-8 ml-8">
            <Link to="/" className={`text-sm font-medium transition-colors hover:text-white ${isActive('/') ? 'text-white' : 'text-slate-400'}`}>
              Home
            </Link>
            <Link to="/all-threats" className={`text-sm font-medium transition-colors hover:text-white ${isActive('/all-threats') ? 'text-white' : 'text-slate-400'}`}>
              All Threats
            </Link>
            <Link to="/about" className={`text-sm font-medium transition-colors hover:text-white ${isActive('/about') ? 'text-white' : 'text-slate-400'}`}>
              About
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64 bg-slate-800 rounded-lg pr-2' : 'w-10'}`}>
              <button
                onClick={() => {
                  if (isSearchOpen && searchQuery.trim()) handleSearch(new Event('submit'));
                  else setIsSearchOpen(!isSearchOpen);
                }}
                className="text-slate-400 hover:text-white transition-colors p-2"
              >
                <Search className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search threats..."
                className={`bg-transparent border-none text-white text-sm focus:ring-0 placeholder-slate-500 transition-all duration-300 ${isSearchOpen ? 'w-full opacity-100 pl-0' : 'w-0 opacity-0 p-0'}`}
              />

              {isSearchOpen && (
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-1 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Link to="/subscribe" className="flex items-center space-x-2 text-sm px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all font-semibold shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-500">
              <Bell className="w-4 h-4" />
              <span>Get Alerts</span>
            </Link>
          </div>

          <button
            className="md:hidden text-slate-300 p-2 hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {
          mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-800 animate-fadeIn bg-slate-900 w-full absolute left-0 shadow-xl">
              <div className="flex flex-col space-y-2 px-4">
                <Link
                  to="/"
                  className={`py-3 px-3 rounded-md font-medium transition-colors text-left flex items-center ${isActive('/') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Activity className="w-4 h-4 mr-3 text-red-500" />
                  Live Feed
                </Link>

                <Link
                  to="/all-threats"
                  className={`py-3 px-3 rounded-md font-medium transition-colors text-left flex items-center ${isActive('/all-threats') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4 mr-3 text-blue-500" />
                  All Threats
                </Link>

                <div className="pt-2 pb-1 text-xs font-bold text-slate-500 uppercase tracking-widest px-3">
                  Categories
                </div>

                <Link to="/category/ransomware" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md block">Ransomware</Link>
                <Link to="/category/phishing" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md block">Phishing & Email</Link>
                <Link to="/category/data-breach" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md block">Data Breaches</Link>
                <Link to="/category/malware" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md block">Malware & Viruses</Link>
                <Link to="/category/vulnerability" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md block">Vulnerabilities</Link>
                <Link to="/category/general" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md block">General Security</Link>

                <Link
                  to="/about"
                  className={`mt-2 py-3 px-3 rounded-md font-medium transition-colors text-left flex items-center ${isActive('/about') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>

                <div className="pt-4 mt-2 border-t border-slate-800">
                  <Link
                    to="/subscribe"
                    className="w-full text-center py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-bold shadow-lg flex items-center justify-center text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    SUBSCRIBE TO ALERTS
                  </Link>
                </div>
              </div>
            </div>
          )
        }
      </nav >
    </header >
  );
}