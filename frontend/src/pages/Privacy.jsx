import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Privacy() {
    return (
        <>
            <Helmet>
                <title>Privacy Policy | Marliz Security</title>
                <meta name="description" content="Privacy Policy for Marliz Security News." />
            </Helmet>

            <div className="bg-slate-950 min-h-screen text-slate-300 py-20 px-4">
                <div className="max-w-4xl mx-auto bg-slate-900/50 rounded-2xl border border-slate-800 p-8 sm:p-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Privacy Policy</h1>
                    <p className="text-sm text-slate-500 mb-8">Last Updated: December 20, 2025</p>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
                            <p>
                                We prioritize your privacy. We generally do not collect personal identification information unless you voluntarily submit it to us through our subscription forms. We may collect non-personal identification information about users whenever they interact with our Site, such as browser name, type of computer, and technical information about means of connection.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Cookies and Web Beacons</h2>
                            <p>
                                Our Site may use "cookies" to enhance User experience. User's web browser places cookies on their hard drive for record-keeping purposes and sometimes to track information about them. You may choose to set your web browser to refuse cookies, or to alert you when cookies are being sent.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Google AdSense & DoubleClick Cookie</h2>
                            <p>
                                Google, as a third-party vendor, uses cookies to serve ads on our Site. Google's use of the DART cookie enables it to serve ads to users based on their visit to our Site and other sites on the Internet. Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy at <a href="http://www.google.com/privacy_ads.html" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">http://www.google.com/privacy_ads.html</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. How We Use Collected Information</h2>
                            <p>
                                Marliz Security may collect and use Users personal information for the following purposes:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>To improve customer service</li>
                                <li>To personalize user experience</li>
                                <li>To send periodic emails (only if subscribed)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Contacting Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please <a href="mailto:johnmarkoguta@gmail.com" className="text-blue-400 hover:text-blue-300 underline">contact us here</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
