import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Terms() {
    return (
        <>
            <Helmet>
                <title>Terms and Conditions | Marliz Security</title>
                <meta name="description" content="Terms and Conditions for using Marliz Security News." />
            </Helmet>

            <div className="bg-slate-950 min-h-screen text-slate-300 py-20 px-4">
                <div className="max-w-4xl mx-auto bg-slate-900/50 rounded-2xl border border-slate-800 p-8 sm:p-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Terms and Conditions</h1>
                    <p className="text-sm text-slate-500 mb-8">Last Updated: December 20, 2025</p>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using Marliz Security ("the Website"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Use of Intelligence</h2>
                            <p>
                                The cybersecurity alerts, threat intelligence, and analysis provided on this website are for informational purposes only. While we strive for accuracy, the rapidly evolving nature of cyber threats means we cannot guarantee that all information is completely up-to-date or error-free at all times.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Intellectual Property</h2>
                            <p>
                                All content, including but not limited to text, graphics, logos, and code is the property of Marliz Security and John Mark and is protected by copyright, trademark, and other conceptual property laws. You may not reproduce, distribute, or create derivative works from this content without explicit permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. AdSense & Third-Party Links</h2>
                            <p>
                                This website may use Google AdSense to display advertisements. These ads are served by Google and/or its partners. We do not endorse any products or services advertised unless explicitly stated. We are not responsible for the content or practices of third-party websites linked to from our site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Disclaimer of Warranties</h2>
                            <p>
                                The website is provided on an "as is" and "as available" basis. Marliz Security explicitly disclaims all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">6. Contact Information</h2>
                            <p>
                                If you have any questions about these Terms, please <a href="mailto:johnmarkoguta@gmail.com" className="text-blue-400 hover:text-blue-300 underline">contact us here</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
