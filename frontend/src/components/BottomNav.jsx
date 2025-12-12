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
                            className={`flex flex-col items-center justify-center space-y-1 ${active ? 'text-primary-600' : 'text-slate-500'
                                }`}
                        >
                            <item.icon className={`w-6 h-6 ${active ? 'fill-current opacity-20' : ''}`} strokeWidth={active ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
