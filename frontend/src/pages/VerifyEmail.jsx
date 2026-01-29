import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, XCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Missing verification token.');
                return;
            }

            try {
                const { data } = await api.get(`/api/subscribers/verify/${token}`);
                if (data.status === 'success') {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed.');
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.detail || 'Invalid or expired token.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <div className="max-w-md w-full">
                <div className="relative group">
                    {/* Background Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-red-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>

                    <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 text-center shadow-2xl">
                        {status === 'loading' && (
                            <div className="flex flex-col items-center gap-6 py-8">
                                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                                <h1 className="text-2xl font-black text-white tracking-tight italic">
                                    Authenticating Access...
                                </h1>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tight mb-4">
                                    Identity Verified.
                                </h1>
                                <p className="text-slate-400 font-medium leading-relaxed mb-8">
                                    Your secure channel is now active. You will receive the next intelligence briefing directly in your inbox.
                                </p>
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl group"
                                >
                                    Enter Portal
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                                    <XCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tight mb-4">
                                    Link Expired.
                                </h1>
                                <p className="text-slate-400 font-medium leading-relaxed mb-8">
                                    {message || "We couldn't verify your access. Please try subscribing again or contact support."}
                                </p>
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all"
                                >
                                    Return to Base
                                </Link>
                            </div>
                        )}

                        <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-slate-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                Secured by Marliz Intel Systems
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
