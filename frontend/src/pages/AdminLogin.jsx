import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { Helmet } from 'react-helmet-async';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

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
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 relative overflow-hidden">
            <Helmet>
                <title>Admin Access | Marliz Security</title>
            </Helmet>

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary-100/50 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-blue-100/50 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-6">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl mb-4 shadow-sm">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Admin Access</h1>
                        <p className="text-slate-500 mt-2">Enter your secure API Key to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                API Key
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="sk_..."
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center animate-shake">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-primary-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
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

                    <p className="text-center mt-6 text-xs text-slate-400">
                        Authorized personnel only. All attempts are logged.
                    </p>
                </div>
            </div>
        </div>
    );
}
