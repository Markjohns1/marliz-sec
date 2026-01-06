import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-4">
            <Helmet>
                <title>Privacy Policy | Marliz Intel</title>
                <meta name="description" content="Privacy Policy for Marliz Intel - Learn how we protect your data." />
            </Helmet>

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Privacy Policy</h1>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-8 backdrop-blur-sm">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-blue-400" /> 1. Information We Collect
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li><strong>Personal Identification Information:</strong> Name, email address, phone number, etc., only when voluntarily submitted (e.g., subscription forms, contact requests).</li>
                            <li><strong>Non-Personal Identification Information:</strong> Browser name, type of computer, operating system, ISP, and other technical information when users interact with our site.</li>
                            <li><strong>Usage Data:</strong> Pages visited, time spent on pages, and other analytical data to help us improve user experience.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-400" /> 2. How We Use Your Information
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>To provide and maintain our Service, including monitoring the usage of our Service.</li>
                            <li>To manage your Account and subscription preferences.</li>
                            <li>To contact you regarding updates, security alerts, and administrative messages.</li>
                            <li>To personalize user experience and deliver content relevant to your interests.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-blue-400" /> 3. Google AdSense & Cookies
                        </h2>
                        <div className="space-y-4 text-slate-400 text-sm md:text-base">
                            <p>
                                Marliz Intel uses Google AdSense to display advertisements. Google uses cookies to serve ads based on a user's prior visits to your website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.
                            </p>
                            <p>
                                <strong>Opting Out:</strong> Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Ad Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.aboutads.info</a>.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-400" /> 4. Data Retention & Security
                        </h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            We retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We maintain appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, or misuse.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">5. Your Data Protection Rights</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Depending on your location, you may have the following rights:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>The right to access, update, or delete the information we have on you.</li>
                            <li>The right of rectification (to correct inaccurate information).</li>
                            <li>The right to object (to our processing of your personal data).</li>
                            <li>The right of restriction (to request that we restrict the processing of your personal information).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">6. Children's Privacy</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us.
                        </p>
                    </section>

                    <section className="pt-8 border-t border-slate-800">
                        <p className="text-sm text-slate-500">
                            Last Updated: December 27, 2025. For any privacy-related concerns, please contact our data officer at <span className="text-blue-400">admin@marlizintel.com</span>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
