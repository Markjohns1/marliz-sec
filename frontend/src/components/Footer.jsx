import { Link } from 'react-router-dom';
import { Shield, Mail, Twitter, Linkedin } from 'lucide-react';

export default function Footer({ categories }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand - Left aligned */}
          <div className="text-left">
          <div className="flex items-center space-x-2 mb-4">
  <div className="p-2 rounded-lg">
    <img 
      src="/logo.jpg" 
      alt="Marliz Sec" 
      className="w-10 h-10 rounded-full"
    />
  </div>
  <span className="text-lg font-bold text-white">Marliz Sec</span>
</div>
            <p className="text-sm mb-4">
              Cybersecurity news in plain English for small business owners.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:hello@cybersecure.news" className="hover:text-primary-400 transition-colors">
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
                <Link to="/about" className="hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/subscribe" className="hover:text-primary-400 transition-colors">
                  Subscribe
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Security Checklist
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Glossary
                </a>
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
              © {currentYear} Marliz Sec News. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="#" className="hover:text-primary-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary-400 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}