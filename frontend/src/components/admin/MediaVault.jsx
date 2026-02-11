import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Upload,
    Image as ImageIcon,
    FileText,
    Trash2,
    Copy,
    Check,
    Loader2,
    Monitor,
    Smartphone,
    Grid,
    Maximize2,
    Search,
    Clock,
    HardDrive
} from 'lucide-react';
import { getMediaList, uploadMedia, deleteMedia } from '../../services/api';

export default function MediaVault() {
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef(null);

    // Fetch media list
    const { data, isLoading } = useQuery({
        queryKey: ['media'],
        queryFn: () => getMediaList()
    });

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: uploadMedia,
        onSuccess: () => {
            queryClient.invalidateQueries(['media']);
            setIsUploading(false);
        },
        onError: () => setIsUploading(false)
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteMedia,
        onSuccess: () => queryClient.invalidateQueries(['media'])
    });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        uploadMutation.mutate(file);
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        setCopySuccess(url);
        setTimeout(() => setCopySuccess(null), 2000);
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredMedia = data?.media?.filter(item =>
        item.original_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl">
                            <ImageIcon className="w-5 h-5 text-white" />
                        </div>
                        Media Vault
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Self-hosted intelligence assets and secure media storage
                    </p>
                </div>

                {/* Upload Button */}
                <div className="flex justify-end items-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={isUploading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        {isUploading ? 'Securing...' : 'Upload Asset'}
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your assets..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-tight">
                        <HardDrive className="w-4 h-4" />
                        <span>Storage: {formatSize(data?.media?.reduce((acc, curr) => acc + curr.size_bytes, 0))}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-800" />
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-tight">
                        <Grid className="w-4 h-4" />
                        <span>{filteredMedia.length} Assets</span>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-slate-400 font-medium font-mono text-sm">Decrypting Vault...</p>
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl p-24 text-center">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ImageIcon className="w-10 h-10 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Vault Empty</h3>
                    <p className="text-slate-500 max-w-xs mx-auto text-sm">Upload images to host them directly on marlizintel.com</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMedia.map((item) => (
                        <div
                            key={item.id}
                            className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10"
                        >
                            {/* Preview Area */}
                            <div className="aspect-video relative bg-slate-950 overflow-hidden flex items-center justify-center">
                                <img
                                    src={item.url}
                                    alt={item.original_name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => window.open(item.url, '_blank')}
                                        className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md"
                                        title="View Full Size"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(item.url)}
                                        className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md"
                                        title="Copy URL"
                                    >
                                        {copySuccess === item.url ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[9px] font-black text-white/70 uppercase">
                                    {item.mime_type.split('/')[1]}
                                </div>
                            </div>

                            {/* Details Area */}
                            <div className="p-4">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <h4 className="text-sm font-bold text-slate-300 truncate flex-1" title={item.original_name}>
                                        {item.original_name}
                                    </h4>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this asset? It will break any articles using this link.')) {
                                                deleteMutation.mutate(item.id);
                                            }
                                        }}
                                        className="p-1.5 text-slate-600 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                        <Clock className="w-3 h-3" />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="w-1 h-1 bg-slate-800 rounded-full" />
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                        {formatSize(item.size_bytes)}
                                    </div>
                                </div>

                                {/* URL display */}
                                <div className="mt-4 p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2 overflow-hidden">
                                    <div className="text-[10px] text-slate-500 truncate font-mono">
                                        {item.url.replace(window.location.origin, '')}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(item.url)}
                                        className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 transition-colors shrink-0"
                                    >
                                        {copySuccess === item.url ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
