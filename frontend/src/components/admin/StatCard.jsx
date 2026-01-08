import React from 'react';

export default function StatCard({ title, value, icon: Icon, color, loading, subtitle }) {
    return (
        <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-xl ${color}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
            </div>
            <h3 className="text-slate-400 text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-wider truncate" title={title}>{title}</h3>
            <div className="text-2xl sm:text-3xl font-black text-white">
                {loading ? '...' : (value?.toLocaleString() || 0)}
            </div>
            {subtitle && <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{subtitle}</p>}
        </div>
    );
}
