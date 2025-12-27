import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, Globe, ShieldCheck } from 'lucide-react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-4">
            <Helmet>
                <title>Contact Us | Marliz Intel</title>
                <meta name="description" content="Get in touch with the Marliz Intel Threat Intelligence team." />
            </Helmet>

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <Mail className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Contact Us</h1>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                        <h2 className="text-2xl font-semibold text-white mb-6">Get in Touch</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Have an intelligence lead, a partnership inquiry, or a technical question? Our team of analysts is ready to assist.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Mail className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Email Analytics</h3>
                                    <p className="text-slate-400 text-sm">admin@marlizintel.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <MessageSquare className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Media & Press</h3>
                                    <p className="text-slate-400 text-sm">press@marlizintel.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Globe className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">Operating Globally</h3>
                                    <p className="text-slate-400 text-sm">Distributed Intelligence Network</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                        <ShieldCheck className="w-16 h-16 text-blue-500 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-4">Secure Intelligence</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Marliz Intel operates with strict data protocols. All communication is filtered through our secure intelligence layers to ensure privacy and integrity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
