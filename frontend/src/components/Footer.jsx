import { Link } from 'react-router-dom';
import { Shield, Mail, Twitter, Linkedin } from 'lucide-react';
import config from '../config';

export default function Footer({ categories }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand - Left aligned */}
          <div className="text-left">
            <Link to="/" className="flex items-center space-x-3 group mb-4">
              <div className="p-2 bg-red-600 rounded-lg group-hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">
                  {config.SITE_NAME.split(' ')[0]}<span className="text-red-500">{config.SITE_NAME.split(' ')[1] || ''}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Cyber Security For Everyone</span>
              </div>
            </Link>
            <p className="text-sm mb-4 text-slate-400">
              Cybersecurity news in plain English. No jargon, just protection for you and your business.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/in/johnmarkoguta" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:johnmarkoguta@gmail.com" className="hover:text-primary-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories - Left aligned */}
          <div className="text-left">
            <h3 className="text-white font-semibold mb-4">Threat Categories</h3>
            <ul className="space-y-2 text-sm">
              {categories?.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources - Left aligned */}
          <div className="text-left">
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/subscribe" className="hover:text-primary-400 transition-colors">
                  Subscribe
                </Link>
              </li>
              <li>
                <Link to="/glossary" className="hover:text-primary-400 transition-colors">
                  Glossary
                </Link>
              </li>

            </ul>
          </div>

          {/* Newsletter - Left aligned */}
          <div className="text-left">
            <h3 className="text-white font-semibold mb-4">Stay Protected</h3>
            <p className="text-sm mb-4">
              Get daily threat alerts in your inbox.
            </p>
            <Link
              to="/subscribe"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-block transition-colors"
            >
              Subscribe Free
            </Link>
          </div>
        </div>

        {/* Bottom Bar - Left Aligned */}
        <div className="border-t border-slate-800 pt-8 text-left">
          <div className="mb-4">
            <p className="text-sm">
              © {currentYear} {config.SITE_NAME}. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/privacy" className="hover:text-primary-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}