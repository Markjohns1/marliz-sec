import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
    FileText,
    Download,
    Loader2,
    ShieldCheck,
    Clock,
    ExternalLink,
    Search,
    BrainCircuit,
    Cpu,
    Lock
} from 'lucide-react';
import axios from 'axios';

// Messages to show during the "waiting" period
const LOADING_MESSAGES = [
    "Initializing Secure Download Channel...",
    "Scanning document for malicious artifacts...",
    "Authenticating intelligence credentials...",
    "Verifying integrity of Marliz Intel Field Manual...",
    "Optimizing stream for local environment...",
    "Resource almost ready. Finalizing encryption...",
    "Almost there! Just a few more seconds...",
    "Final handshake with secure media vault...",
    "Decrypting material for authorized access..."
];

export default function DownloadPage() {
    const { assetId } = useParams();
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds of ad revenue time
    const [progress, setProgress] = useState(0);
    const [surveyAnswered, setSurveyAnswered] = useState(false);
    const [surveyData, setSurveyData] = useState({ findUs: '', area: '' });
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // Fetch asset details (optional, but good for name/size)
    // For now, let's assume we can get it or just use the ID
    const { data: asset, isLoading, error } = useQuery({
        queryKey: ['asset', assetId],
        queryFn: async () => {
            // We need a public endpoint or just use the ID to serve the file
            // Let's assume there's a /api/media/public/:id
            const res = await axios.get(`${import.meta.env.VITE_API_URL || '/api'}/media/public/${assetId}`);
            return res.data;
        },
        retry: false
    });

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
                setProgress(prev => Math.min(100, prev + (100 / 60)));

                // Rotate messages every few seconds
                if (timeLeft % 7 === 0) {
                    setCurrentMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleDownload = () => {
        if (asset?.url) {
            window.open(asset.url, '_blank');
        }
    };

    if (error) return <Navigate to="/" />;

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4">
            <Helmet>
                <title>Secure Resource Download | Marliz Intel</title>
                <meta name="robots" content="noindex, follow" />
            </Helmet>

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-black uppercase tracking-widest">
                        <Lock className="w-3 h-3" /> Secure Transmission Channel
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white">
                        {isLoading ? 'Preparing Resource...' : asset?.original_name || 'Cyber Intelligence Manual'}
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
                        You have requested access to high-value intelligence. Please remain on this page while we authenticate your request and prepare the document.
                    </p>
                </div>

                {/* Main Interaction Area */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-10 relative overflow-hidden backdrop-blur-xl">
                    {/* Progress Bar Background */}
                    <div className="absolute top-0 left-0 h-1 bg-emerald-600 transition-all duration-1000" style={{ width: `${progress}%` }} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        {/* Status Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                                    <FileText className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</div>
                                    <div className="text-white font-bold flex items-center gap-2">
                                        {timeLeft > 0 ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                                Preparing Download
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                Ready for Access
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tight">
                                    <span>Intelligence Readiness</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-emerald-500 text-xs font-medium italic animate-pulse">
                                    "{LOADING_MESSAGES[currentMessageIndex]}"
                                </p>
                            </div>

                            {timeLeft > 0 && (
                                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="bg-slate-800 p-2 rounded-lg">
                                        <Clock className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Wait Time</div>
                                        <div className="text-white font-mono text-lg">{timeLeft}s</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Survey Section */}
                        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 text-emerald-500" /> Help our Intelligence
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                While you wait, please help us tailor future intelligence assets by answering two quick questions.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">Where did you find us?</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                                        onChange={(e) => setSurveyData(prev => ({ ...prev, findUs: e.target.value }))}
                                    >
                                        <option value="">Select source...</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="google">Google Search</option>
                                        <option value="social">Social Media</option>
                                        <option value="direct">Direct Link / Referral</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">Your Area of Interest?</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                                        onChange={(e) => setSurveyData(prev => ({ ...prev, area: e.target.value }))}
                                    >
                                        <option value="">Select interest...</option>
                                        <option value="offensive">Offensive Security (Red Team)</option>
                                        <option value="defensive">Defensive Security (Blue Team)</option>
                                        <option value="dfir">Forensics & Incident Response</option>
                                        <option value="dev">Secure Engineering / DevSecOps</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Download Button */}
                    <div className="mt-8">
                        <button
                            onClick={handleDownload}
                            disabled={timeLeft > 0}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${timeLeft > 0
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-500/20 active:scale-[0.98]'
                                }`}
                        >
                            {timeLeft > 0 ? (
                                <>
                                    <Lock className="w-5 h-5" /> Authentication Pending
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" /> Access Secure Document
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Ad Placement Area */}
                <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
                    {/* This is where Google AdSense will display ads automatically */}
                    <p className="text-slate-600 text-xs font-mono mb-4 uppercase tracking-[0.2em]">Sponsorship Intelligence Space</p>
                    <div className="text-slate-700 italic text-sm">
                        Supporting the research & infrastructure of Marliz Intel Bureau.
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-t border-slate-900">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                        <Cpu className="w-4 h-4" /> Served by Secure Media Vault v2.0
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="/terms" className="text-slate-600 hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest transition-colors">Terms of Access</a>
                        <a href="/privacy" className="text-slate-600 hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest transition-colors">Intelligence Privacy</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
