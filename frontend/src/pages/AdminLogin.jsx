import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { Helmet } from 'react-helmet-async';
import { Lock, ArrowRight, ShieldCheck, Home } from 'lucide-react';

export default function AdminLogin() {
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(key);
            navigate('/console');
        } catch (err) {
            setError('Invalid API Key. Access Denied.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-950 relative overflow-hidden">
            <Helmet>
                <title>Admin Access | Marliz Security</title>
            </Helmet>

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-900/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-primary-900/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-6">
                <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-8">

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/30 text-blue-400 rounded-2xl mb-4 shadow-sm border border-blue-500/20">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                        <p className="text-slate-400 mt-2">Enter your secure API Key to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                API Key
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none placeholder-slate-500"
                                    placeholder="sk_..."
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-900/30 text-red-400 text-sm rounded-lg flex items-center border border-red-500/30">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    Access Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-xs text-slate-500 mb-6">
                        Authorized personnel only. All attempts are logged.
                    </p>

                    <div className="border-t border-slate-800 pt-6 text-center">
                        <a
                            href="/"
                            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-primary-400 transition-colors group"
                        >
                            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mr-3 group-hover:bg-primary-900/20 group-hover:text-primary-400 transition-all">
                                <Home className="w-4 h-4" />
                            </span>
                            Return to Live Site
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
