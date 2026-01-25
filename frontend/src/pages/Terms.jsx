import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Terms() {
    return (
        <>
            <Helmet>
                <title>Terms and Conditions | Marliz Intel</title>
                <meta name="description" content="Terms and Conditions for using Marliz Intel." />
            </Helmet>

            <div className="bg-slate-950 min-h-screen text-slate-300 py-20 px-4">
                <div className="max-w-4xl mx-auto bg-slate-900/50 rounded-2xl border border-slate-800 p-8 sm:p-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Terms and Conditions</h1>
                    <p className="text-sm text-slate-500 mb-8">Last Updated: January 20, 2026</p>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using Marliz Security ("the Website"), you accept and agree to be bound by the terms and provision of this agreement. Use of our services constitutes acceptance of these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Use of Intelligence Services</h2>
                            <p>
                                The cybersecurity alerts, threat intelligence, and analysis provided on this website are for informational and educational purposes only. Marliz Security exercises commercially reasonable efforts to ensure accuracy, but due to the rapidly evolving nature of cyber threats, we cannot guarantee that all information is real-time or error-free. Reliance on this information is at your own risk.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Intellectual Property Rights</h2>
                            <p>
                                All content, including text, graphics, logos, software, and threat analysis code, is the exclusive property of Marliz Intel and is protected by international copyright and intellectual property laws. You may not reproduce, distribute, display, or create derivative works of this content without explicit written permission from Marliz Intel.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. User Obligations</h2>
                            <p>
                                You agree not to use the Website for any unlawful purpose or in any way that interrupts, damages, or impairs the service. potentially harmful automation, scraping, or data mining of our threat database without authorization is strictly prohibited.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. AdSense & Third-Party Advertisements</h2>
                            <p>
                                This website utilizes Google AdSense to serve advertisements. These advertisements are automated and do not constitute an endorsement by Marliz Intel. We are not responsible for the content, privacy practices, or availability of third-party websites linked through these advertisements. Your interaction with third-party ads is solely between you and the advertiser.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">6. Disclaimer of Warranties</h2>
                            <p>
                                The services are provided "as is" and "as available" without any warranties of any kind, express or implied. Marliz Intel disclaims all warranties, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the service will be uninterrupted, secure, or free from viruses.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
                            <p>
                                In no event shall Marliz Intel or its affiliates be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service, including but not limited to damages for loss of profits, data, or other intangibles, even if we have been advised of the possibility of such damages.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">8. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the courts located in Nairobi, Kenya.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">9. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these terms at any time. We will provide notice of significant changes by updating the "Last Updated" date at the top of this policy. Your continued use of the Service after any such change constitutes your acceptance of the new Terms of Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">10. Contact Information</h2>
                            <p>
                                If you have any questions about these Terms, please contact us at <a href="mailto:admin@marlizintel.com" className="text-blue-400 hover:text-blue-300 underline">admin@marlizintel.com</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
