import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Upload,
    Image as ImageIcon,
    Trash2,
    Copy,
    Check,
    Loader2,
    Grid,
    Maximize2,
    Search,
    Clock,
    Edit2,
    Save,
    Type,
    FileText,
    Files,
    Share2,
    Globe,
    FileQuestion,
    Eye,
    EyeOff,
    ShieldCheck,
    HardDrive
} from 'lucide-react';
import { getMediaList, uploadMedia, deleteMedia, updateMedia } from '../../services/api';

export default function MediaVault() {
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingAltId, setEditingAltId] = useState(null);
    const [tempAlt, setTempAlt] = useState('');
    const [activeTab, setActiveTab] = useState('photos'); // 'photos' or 'pdfs'
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

    // Update Meta mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, updates }) => updateMedia(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries(['media']);
            setEditingAltId(null);
        }
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

    const filteredMedia = data?.media?.filter(item => {
        const matchesSearch = (item.original_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.alt_text || '').toLowerCase().includes(searchQuery.toLowerCase());

        const isPdf = item.mime_type === 'application/pdf';
        const matchesTab = activeTab === 'pdfs' ? isPdf : !isPdf;

        return matchesSearch && matchesTab;
    }) || [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-emerald-600 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        Secure Intelligence Vault
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Self-hosted, <span className="text-emerald-500 font-bold">Auto-Optimized (WebP)</span>, and SEO-Verified Assets
                    </p>
                </div>

                <div className="flex justify-end items-center">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf" />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={isUploading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        {isUploading ? 'Securing Asset...' : 'Upload Intelligence'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-900/50 border border-slate-800 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('photos')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'photos' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    <ImageIcon className="w-4 h-4" /> Photos
                </button>
                <button
                    onClick={() => setActiveTab('pdfs')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'pdfs' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    <FileText className="w-4 h-4" /> PDFs & Books
                </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search assets or alt text..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-tight">
                        <HardDrive className="w-4 h-4" />
                        <span>Disk Usage: {formatSize(data?.media?.reduce((acc, curr) => acc + curr.size_bytes, 0))}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-800" />
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-tight">
                        <Grid className="w-4 h-4" />
                        <span>{filteredMedia.length} Web-Ready Assets</span>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    <p className="text-slate-400 font-medium font-mono text-sm">Decrypting Secure Store...</p>
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl p-24 text-center">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ImageIcon className="w-10 h-10 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Vault Empty</h3>
                    <p className="text-slate-500 max-w-xs mx-auto text-sm">Upload images to auto-optimize them for Marliz Intel.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMedia.map((item) => (
                        <div key={item.id} className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all hover:border-emerald-500/50 hover:shadow-2xl">
                            <div className="aspect-video relative bg-slate-950 overflow-hidden flex items-center justify-center">
                                {item.mime_type === 'application/pdf' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 text-slate-500">
                                        <FileText className="w-12 h-12 mb-2 text-emerald-500/50" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">PDF Document</span>
                                    </div>
                                ) : (
                                    <img src={item.url} alt={item.alt_text || item.original_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button onClick={() => window.open(item.url, '_blank')} className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md" title="View Full Size"><Maximize2 className="w-4 h-4" /></button>
                                    <button
                                        onClick={() => copyToClipboard(item.url)}
                                        className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md"
                                        title="Copy Direct Link"
                                    >
                                        {copySuccess === item.url ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(`${window.location.origin}/download/${item.id}`)}
                                        className="p-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 rounded-lg backdrop-blur-md border border-emerald-500/30"
                                        title="Copy Revenue Link (Gated)"
                                    >
                                        {copySuccess === `${window.location.origin}/download/${item.id}` ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-600/80 backdrop-blur-md rounded-md text-[9px] font-black text-white uppercase tracking-widest">
                                    {item.mime_type === 'application/pdf' ? 'Cyber Intel PDF' : 'Optimized WebP'}
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-[11px] font-black text-slate-400 truncate flex-1 uppercase tracking-wider" title={item.original_name}>
                                        {item.original_name}
                                    </h4>
                                    <button
                                        onClick={() => { if (window.confirm('Delete this optimized asset?')) deleteMutation.mutate(item.id); }}
                                        className="p-1 text-slate-600 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Alt Text SEO Field */}
                                <div className="relative group/alt bg-slate-950 border border-slate-800 rounded-xl p-3 transition-all hover:border-emerald-500/30">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1">
                                            <Type className="w-3 h-3" /> SEO Alt Text
                                        </label>
                                        {editingAltId !== item.id ? (
                                            <button
                                                onClick={() => { setEditingAltId(item.id); setTempAlt(item.alt_text || ''); }}
                                                className="opacity-0 group-hover/alt:opacity-100 p-1 text-emerald-500 hover:text-emerald-400 transition-all"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => updateMutation.mutate({ id: item.id, updates: { alt_text: tempAlt } })}
                                                className="p-1 text-emerald-500"
                                            >
                                                <Save className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {editingAltId === item.id ? (
                                        <div className="space-y-4 mt-2">
                                            <div>
                                                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">SEO Alt Text ({item.mime_type === 'application/pdf' ? 'Title' : 'Alt'})</label>
                                                <input
                                                    type="text"
                                                    value={tempAlt}
                                                    onChange={(e) => setTempAlt(e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                                    autoFocus
                                                />
                                            </div>

                                            {item.mime_type === 'application/pdf' && (
                                                <>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Intelligence Summary (Shows on Resources Page)</label>
                                                        <textarea
                                                            value={item.summary || ''}
                                                            onChange={(e) => updateMutation.mutate({ id: item.id, updates: { summary: e.target.value } })}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 min-h-[60px]"
                                                            placeholder="Short summary of the manual's contents..."
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                                                        <div className="flex items-center gap-2">
                                                            <Globe className={`w-4 h-4 ${item.is_published ? 'text-emerald-500' : 'text-slate-600'}`} />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">Public Resource</span>
                                                        </div>
                                                        <button
                                                            onClick={() => updateMutation.mutate({ id: item.id, updates: { is_published: !item.is_published } })}
                                                            className={`w-10 h-5 rounded-full transition-all relative ${item.is_published ? 'bg-emerald-600' : 'bg-slate-700'}`}
                                                        >
                                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.is_published ? 'right-1' : 'left-1'}`} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}

                                            <button
                                                onClick={() => updateMutation.mutate({ id: item.id, updates: { alt_text: tempAlt } })}
                                                className="w-full py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-500"
                                            >
                                                Save All Changes
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-1 space-y-2">
                                            <p className={`text-xs ${item.alt_text ? 'text-slate-300' : 'text-slate-600 italic'} truncate`}>
                                                {item.alt_text || 'No Title - Low Impact'}
                                            </p>
                                            {item.mime_type === 'application/pdf' && (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        {item.is_published ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
                                                        <span className={`text-[9px] font-black uppercase ${item.is_published ? 'text-emerald-500' : 'text-slate-600'}`}>
                                                            {item.is_published ? 'Published' : 'Private'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] font-medium text-slate-500 truncate flex-1 ml-2 text-right">
                                                        {item.summary ? 'Summary Written' : 'No Summary'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/50">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                        <Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="text-[10px] text-emerald-500 font-black uppercase tracking-tight bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        {formatSize(item.size_bytes)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
