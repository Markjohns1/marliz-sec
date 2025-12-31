import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, Shield, Activity } from 'lucide-react';
import config from '../config';
import QuickSearch from './QuickSearch';

export default function Header({ categories }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menus on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-slate-900 border-b border-slate-800 fixed top-0 left-0 right-0 z-50 shadow-lg w-full">
      <nav className="w-full">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center space-x-3 group min-w-0 flex-shrink-1">
            <div className="p-2 bg-red-600 rounded-lg group-hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.5)] flex-shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {config.SITE_NAME.split(' ')[0]}<span className="text-red-500">{config.SITE_NAME.split(' ')[1] || ''}</span>
              </span>
              <span className="text-[8px] sm:text-xs text-slate-400 font-mono tracking-wider truncate uppercase">Intelligence Bureau</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 ml-8 flex-shrink-0">
            <Link to="/" className={`text-sm font-medium transition-colors hover:text-white ${isActive('/') ? 'text-white' : 'text-slate-400'}`}>
              Home
            </Link>

            {/* Categories Dropdown (Simple CSS Hover) */}
            <div className="relative group p-4 -m-4">
              <button className={`text-sm font-medium transition-colors hover:text-white flex items-center ${location.pathname.includes('/category/') ? 'text-white' : 'text-slate-400'}`}>
                Categories
              </button>
              {/* Dropdown Content */}
              <div className="absolute top-10 left-0 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top pt-2">
                <div className="p-2 space-y-1">
                  <Link to="/category/ransomware" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">Ransomware</Link>
                  <Link to="/category/phishing" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">Phishing & Email</Link>
                  <Link to="/category/data-breach" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">Data Breaches</Link>
                  <Link to="/category/malware" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">Malware & Viruses</Link>
                  <Link to="/category/vulnerability" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">Vulnerabilities</Link>
                </div>
              </div>
            </div>

            <Link to="/all-threats" className={`text-sm font-medium transition-colors hover:text-white ${isActive('/all-threats') ? 'text-white' : 'text-slate-400'}`}>
              All Threats
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-1 justify-end max-w-md ml-auto mr-4">
            <QuickSearch
              liveResults={true}
              className="w-full"
              placeholder="Search intelligence..."
            />

            <Link to="/subscribe" className="flex items-center space-x-2 text-sm px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)] border border-red-500 flex-shrink-0">
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1">
            <button
              className={`p-2 rounded-lg transition-colors ${mobileSearchOpen ? 'text-blue-500 bg-slate-800' : 'text-slate-300 hover:bg-slate-800'}`}
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              className={`p-2 rounded-lg transition-colors ${mobileMenuOpen ? 'text-red-500 bg-slate-800' : 'text-slate-300 hover:bg-slate-800'}`}
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (mobileSearchOpen) setMobileSearchOpen(false);
              }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Drops down below header */}
        {mobileSearchOpen && (
          <div className="md:hidden p-4 bg-slate-900 border-t border-slate-800 animate-in slide-in-from-top duration-200">
            <QuickSearch
              liveResults={true}
              placeholder="Find threats..."
              className="w-full"
            />
          </div>
        )}

        {/* Mobile Nav Menu */}
        {
          mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-800 animate-fadeIn bg-slate-900 w-full absolute left-0 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto pb-24">
              <div className="flex flex-col space-y-2 px-4">
                <Link
                  to="/"
                  className={`py-3 px-3 rounded-md font-medium transition-colors text-left flex items-center ${isActive('/') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <Activity className="w-4 h-4 mr-3 text-red-500" />
                  Live Feed
                </Link>

                <Link
                  to="/all-threats"
                  className={`py-3 px-3 rounded-md font-medium transition-colors text-left flex items-center ${isActive('/all-threats') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <Shield className="w-4 h-4 mr-3 text-blue-500" />
                  All Threats
                </Link>

                <div className="pt-2 pb-1 text-xs font-bold text-slate-500 uppercase tracking-widest px-3">
                  Categories
                </div>

                <Link to="/category/ransomware" className="py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md block text-sm">Ransomware</Link>
                <Link to="/category/phishing" className="py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md block text-sm">Phishing & Email</Link>
                <Link to="/category/data-breach" className="py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md block text-sm">Data Breaches</Link>
                <Link to="/category/malware" className="py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md block text-sm">Malware & Viruses</Link>
                <Link to="/category/vulnerability" className="py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md block text-sm">Vulnerabilities</Link>
                <Link to="/category/general" className="py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md block text-sm">General Security</Link>

                <Link
                  to="/about"
                  className={`mt-2 py-3 px-3 rounded-md font-medium transition-colors text-left flex items-center ${isActive('/about') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  About Us
                </Link>

                <div className="pt-4 mt-2 border-t border-slate-800">
                  <Link
                    to="/subscribe"
                    className="w-full text-center py-4 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-bold shadow-lg flex items-center justify-center text-sm border border-red-500"
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