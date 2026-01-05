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
                            <Eye className="w-5 h-5 text-blue-400" /> 1. Introduction
                        </h2>
                        <p className="text-slate-400 leading-relaxed">
                            At Marliz Intel, accessible from marlizintel.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Marliz Intel and how we use it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-blue-400" /> 2. Google AdSense & Third-Party Cookies
                        </h2>
                        <div className="space-y-4 text-slate-400 text-sm md:text-base">
                            <p>
                                Marliz Intel uses Google AdSense to serve advertisements. Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
                            </p>
                            <p>
                                We participate in the Google AdSense program, which utilizes cookies to track user behavior and interests across the web. This data is used by Google and its partners to display personalized advertisements that are more relevant to you.
                            </p>
                            <p>
                                You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Ad Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.aboutads.info</a>.
                            </p>
                            <p>
                                If you have not opted out of third-party ad serving, the cookies of other third-party vendors or ad networks may also be used to serve ads on our site.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-400" /> 3. Data Collection
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li>Log Files: We follow a standard procedure of using log files. These files log visitors when they visit websites.</li>
                            <li>Cookies and Web Beacons: Like any other website, Marliz Intel uses 'cookies' to store information including visitors' preferences.</li>
                            <li>Personal Information: If you subscribe to our newsletter, we collect your email address purely for the purpose of sending intelligence updates.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">4. Privacy Policies
                        </h2>
                        <p className="text-slate-400">
                            Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Marliz Intel, which are sent directly to users' browser. They automatically receive your IP address when this occurs.
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
