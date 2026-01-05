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
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-50 safe-area-bottom">
            <div className="grid grid-cols-4 h-16">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${active ? 'text-red-500' : 'text-slate-500'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-all duration-300 ${active ? 'bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-transparent text-slate-500'}`}>
                                <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                            </div>
                            <span className={`text-[9px] uppercase tracking-widest transition-all ${active ? 'font-black opacity-100' : 'font-bold opacity-50'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
