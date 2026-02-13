import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
    FileText,
    Download,
    ShieldCheck,
    HardDrive,
    Search,
    BookOpen,
    ArrowRight,
    Loader2,
    Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublicResources } from '../services/api';

export default function Resources() {
    const { data, isLoading } = useQuery({
        queryKey: ['public-resources'],
        queryFn: getPublicResources
    });

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const resources = data?.media || [];

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-20 px-4">
            <Helmet>
                <title>Intelligence Resources & Field Manuals | Marliz Intel</title>
                <meta name="description" content="Access authorized cybersecurity field manuals, DFIR reports, and technical intelligence documents from the Marliz Intel Bureau." />
            </Helmet>

            <div className="max-w-7xl mx-auto space-y-12">
                {/* Hero section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-black uppercase tracking-widest">
                        <Lock className="w-3 h-3" /> Authorized Knowledge Base
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                        Intel <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 text-glow-emerald">Field Manuals</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-lg">
                        Premium technical documentation, forensic analysis reports, and offensive security playbooks. Managed and verified by the Marliz Intel Bureau.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Scanning Archive...</p>
                    </div>
                ) : resources.length === 0 ? (
                    <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl p-20 text-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Archive Restricted</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">New intelligence manuals are currently being declassified. Check back soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {resources.map((resource) => (
                            <div key={resource.id} className="group relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col">
                                {/* Card Header/Icon */}
                                <div className="aspect-video bg-slate-950 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <FileText className="w-20 h-20 text-slate-800 group-hover:text-emerald-500/20 transition-colors" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="flex items-center gap-2">
                                            <div className="px-2 py-1 bg-emerald-600 rounded text-[9px] font-black text-white uppercase tracking-widest">PDF Document</div>
                                            <div className="px-2 py-1 bg-slate-800 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                <HardDrive className="w-2 h-2" /> {formatSize(resource.size_bytes)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-grow flex flex-col space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                                            {resource.alt_text || resource.original_name}
                                        </h3>
                                        <p className="text-slate-400 text-sm mt-3 leading-relaxed line-clamp-3 italic">
                                            {resource.summary || "This technical manual contains specialized intelligence gathered by the Marliz Intel Bureau. Access is authorized for research and educational purposes."}
                                        </p>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-slate-800 mt-auto">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Authorized
                                        </div>
                                        <Link
                                            to={`/download/${resource.id}`}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 group/btn"
                                        >
                                            Get Access <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info section for SEO / Trust */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 pt-20 border-t border-slate-900">
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Intelligence Ethics
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            All documents provided here are the intellectual property of Marliz Intel Bureau. They are intended to improve the defensive posture of engineers and security practitioners. Misuse of the methods described is strictly prohibited.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <Download className="w-5 h-5 text-emerald-500" /> Secure Distribution
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Marliz Intel uses a secure, de-indexed distribution channel to ensure that our higher-value intelligence assets are delivered directly to legitimate researchers, bypassing automated scraping and indexing by unwanted parties.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
