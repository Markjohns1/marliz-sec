import { useEffect, useRef } from 'react';

export default function AdUnit({ format = 'auto', className = '', slotId = '1234567890' }) {
    const adRef = useRef(null);

    // Helper to determine dimensions for placeholders
    const getDimensions = () => {
        switch (format) {
            case 'vertical': return 'min-h-[600px] w-[160px]';
            case 'rectangle': return 'min-h-[250px] w-[300px]';
            case 'fluid': return 'min-h-[100px] w-full';
            default: return 'min-h-[250px] w-full';
        }
    };

    return (
        <div className={`ad-container flex justify-center my-6 ${className}`}>
            <div className={`bg-slate-900/40 border border-slate-800/50 border-dashed rounded-lg flex flex-col items-center justify-center p-4 text-center overflow-hidden ${getDimensions()}`}>
                <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider mb-2">
                    Advertisement
                </span>

                {/* 
                  ADSENSE LIVE UNIT
                  Replace client ID with your ca-pub-XXXXXX when approved.
                */}
                <ins className="adsbygoogle"
                    style={{ display: 'block', minWidth: '120px', minHeight: '50px' }}
                    data-ad-client="ca-pub-5581330887172926"
                    data-ad-slot={slotId}
                    data-ad-format={format}
                    data-full-width-responsive="true"></ins>
            </div>
        </div>
    );
}
