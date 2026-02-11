import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    X,
    Search,
    Image as ImageIcon,
    Loader2,
    Check,
    Cloud
} from 'lucide-react';
import { getMediaList } from '../../services/api';

export default function MediaPickerModal({ isOpen, onClose, onSelect }) {
    const [searchQuery, setSearchQuery] = useState('');
    const { data, isLoading } = useQuery({
        queryKey: ['media'],
        queryFn: getMediaList,
        enabled: isOpen
    });

    if (!isOpen) return null;

    const filteredMedia = data?.media?.filter(item =>
        item.original_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl">
                            <Cloud className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Select Media Asset</h2>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Marliz Secure Storage</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Sub-header / Search */}
                <div className="p-4 bg-slate-950/50 border-b border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Locate intelligence images..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            <p className="text-slate-400 text-xs font-mono">Loading assets...</p>
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="text-center py-20">
                            <ImageIcon className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-500 text-sm">No assets found matching your search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredMedia.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onSelect(item.url);
                                        onClose();
                                    }}
                                    className="group relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-blue-500 transition-all text-left"
                                >
                                    <img
                                        src={item.url}
                                        alt={item.original_name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="p-2 bg-blue-600 rounded-full shadow-lg">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                        <p className="text-[9px] font-bold text-white truncate">{item.original_name}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
