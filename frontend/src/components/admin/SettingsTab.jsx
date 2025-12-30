import React from 'react';
import { Clock } from 'lucide-react';

export default function SettingsTab() {
    return (
        <div className="card p-12 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Protocol Pending</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto uppercase tracking-widest text-[10px]">
                We're currently perfecting the core settings management system to ensure maximum security performance.
            </p>
        </div>
    );
}
