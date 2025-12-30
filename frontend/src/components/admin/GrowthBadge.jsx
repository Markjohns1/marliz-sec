import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function GrowthBadge({ value }) {
    const isPositive = value >= 0;
    return (
        <div className={`flex items-center gap-1 text-lg sm:text-2xl font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            {Math.abs(value).toFixed(1)}%
        </div>
    );
}
