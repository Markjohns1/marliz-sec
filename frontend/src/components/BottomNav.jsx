import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, List, Info, Bell } from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/all-threats', icon: Shield, label: 'Threats' },
        { path: '/about', icon: Info, label: 'About' },
        { path: '/subscribe', icon: Bell, label: 'Alerts' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
            <div className="grid grid-cols-4 h-16">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all duration-300 ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'bg-transparent text-slate-400'}`}>
                                <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                            </div>
                            <span className={`text-[9px] uppercase tracking-widest transition-all ${active ? 'font-black' : 'font-bold opacity-70'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
