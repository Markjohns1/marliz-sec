import { Shield, Target, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us - Cybersecurity News for Small Business | Marliz Sec</title>
        <meta name="description" content="Learn how Marliz Sec News helps small businesses stay protected by translating complex cyber threats into simple, actionable advice." />
      </Helmet>

      <div className="bg-slate-950 text-slate-200 min-h-screen">
        {/* Premium Dark Hero */}
        <section className="relative py-24 md:py-32 overflow-hidden border-b border-slate-800 bg-slate-900/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(220,38,38,0.1)_0%,transparent_50%)]"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-1.5 rounded-full mb-6 font-bold text-xs uppercase tracking-widest">
                Our Intelligence Manifesto
              </div>
              <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight text-white">
                Democratizing <span className="text-red-500">Global Threat Intelligence.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-3xl">
                Cybersecurity remains the greatest barrier to digital freedom. We exist to bridge the gap between complex adversary tactics and actionable business defense.
              </p>
            </div>
          </div>
        </section>

        {/* The Problem & Our Philosophy */}
        <section className="py-24 border-b border-slate-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-start">
              <div>
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-red-600 rounded-full"></div>
                  The Transparency Crisis
                </h2>
                <div className="space-y-6 text-lg text-slate-400 leading-relaxed">
                  <p>
                    In the current digital landscape, high-grade threat intelligence is locked behind $50k/year corporate paywalls. This leaves small businesses, community organizations, and everyday users vulnerable to sophisticated ransomware and social engineering.
                  </p>
                  <p>
                    <strong className="text-slate-200">Marliz Sec</strong> was founded on a singular radical idea: <span className="text-slate-100 italic">Security intelligence should be a public utility, not a luxury good.</span>
                  </p>
                  <p>
                    We cut through the "Security Theater" and marketing fluff. Our analysts dive deep into raw exploit data, black-market leaks, and technical research to extract the only thing that matters: <strong className="text-white">What is the risk, and how do you stop it?</strong>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-red-500/30 transition-all group">
                  <div className="bg-red-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Enterprise Defense</h3>
                  <p className="text-slate-400">Military-grade analysis translated for the modern business owner.</p>
                </div>
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all group">
                  <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Precision Impact</h3>
                  <p className="text-slate-400">Zero-fluff reports focused on technical remediation and financial risk.</p>
                </div>
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all group">
                  <div className="bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Real-Time Alerts</h3>
                  <p className="text-slate-400">Our neural monitoring engine scans global feeds every 4 hours.</p>
                </div>
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all group">
                  <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Community First</h3>
                  <p className="text-slate-400">Protecting over 2,500 entities across East Africa and beyond.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Network Section */}
        <section className="py-24 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-16">The Marliz Intelligence Network</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="text-5xl font-black text-red-500">140+</div>
                <h4 className="text-lg font-bold text-white">Verified Data Sources</h4>
                <p className="text-slate-500 text-sm">We aggregate from GitHub exploits, Dark Web monitoring, and NIST vulnerability databases.</p>
              </div>
              <div className="space-y-4">
                <div className="text-5xl font-black text-blue-500">2x</div>
                <h4 className="text-lg font-bold text-white">Daily Intelligence Sync</h4>
                <p className="text-slate-500 text-sm">Global threat cycles move fast; our "Intelligence Heartbeat" ensures you're never behind.</p>
              </div>
              <div className="space-y-4">
                <div className="text-5xl font-black text-emerald-500">0</div>
                <h4 className="text-lg font-bold text-white">Conflicts of Interest</h4>
                <p className="text-slate-500 text-sm">We sell no security products. Our only priority is the accuracy of the intelligence report.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership - Authenticity Section */}
        <section className="py-24 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-gradient-to-r from-slate-900 to-slate-950 p-12 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield className="w-32 h-32 text-red-500" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center text-center md:text-left">
                <div className="w-32 h-32 bg-red-600 rounded-2xl flex items-center justify-center font-black text-5xl text-white shadow-xl flex-shrink-0 rotate-3">
                  JM
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">A Message from the Founder</h2>
                  <p className="text-xl text-slate-300 italic mb-6 leading-relaxed">
                    "When a major breach happens, most news outlets report on the stock price. We report on the stolen data and the open ports. We are here to give you the tools to fight back."
                  </p>
                  <div className="space-y-4 text-slate-400">
                    <p>
                      John Mark founded <strong>Marliz Intel</strong> after seeing how vulnerable local businesses in Kenya and East Africa were to global ransomware groups. What started as a local alerting service has evolved into a sophisticated intelligence platform powered by ethical AI and human oversight.
                    </p>
                    <p>
                      Our team operates with a "Zero-Trust" approach to news. We don't just summarize headlines; we verify technical payloads and provide remediation steps that actually work in production environments.
                    </p>
                  </div>
                  <div className="mt-8">
                    <div className="font-bold text-white text-lg">John Mark</div>
                    <div className="text-red-500 font-mono text-sm tracking-widest uppercase italic">Lead Cyber Threat Analyst</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ethical AI Section */}
        <section className="py-24 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h3 className="text-2xl font-bold text-white mb-4">Transparency & Ethical AI</h3>
              <p className="text-slate-500">
                Our platform utilizes advanced Large Language Models for speed, but every intelligence report follows strict editorial guidelines. We do not use AI to speculate; we use it to simplify complex technical logs into actionable insights while maintaining the integrity of the original research.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold border border-slate-800 hover:border-slate-600 transition-all">
                Contact Our Analysts
              </Link>
              <Link to="/subscribe" className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 flex items-center gap-2">
                <Bell className="w-4 h-4" /> Join The Feed
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA Footer */}
        <section className="py-12 border-t border-slate-900 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-600 text-sm font-mono uppercase tracking-[0.2em]">
              Intelligence Bureau &copy; {new Date().getFullYear()} Marliz International Security Group
            </p>
          </div>
        </section>
      </div>
    </>
  );
}