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

      <div className="bg-slate-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-6">
                Protecting You. Protecting Everyone.
              </h1>
              <p className="text-xl text-primary-100">
                We believe everyone—from grandmothers to CEOs—deserves to be safe online without needing a computer science degree.
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
                <p className="text-lg text-slate-700 mb-4">
                  <strong className="text-primary-600">Cybersecurity is broken.</strong> It's full of confusing words and scare tactics.
                </p>
                <p className="text-lg text-slate-700 mb-4">
                  We provide direct, verified intelligence as it happens. No filters, no hidden agendas. We report the facts, tell you why it matters, and show you exactly how to stay safe.
                </p>
                <p className="text-lg text-slate-700">
                  Transparency is our core value. Information should be free and accessible to everyone.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-primary-50 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-primary-600 mb-2">2.5K+</div>
                  <div className="text-slate-600">Businesses Protected</div>
                </div>
                <div className="bg-success-50 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-success-600 mb-2">Daily</div>
                  <div className="text-slate-600">Threat Alerts</div>
                </div>
                <div className="bg-warning-50 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-warning-600 mb-2">3 min</div>
                  <div className="text-slate-600">Average Read Time</div>
                </div>
                <div className="bg-danger-50 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-danger-600 mb-2">100%</div>
                  <div className="text-slate-600">Free Forever</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership - John Mark */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Who We Are</h2>
              <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                <p className="text-xl leading-relaxed text-slate-300 mb-6">
                  "Marliz Security isn't an algorithm. It's us."
                </p>
                <p className="text-lg text-slate-400 mb-8">
                  Founded and led by <strong>John Mark</strong>, we are a dedicated team of security analysts committed to bringing you the truth. We don't rely on automated summaries; we read the raw data, verify the sources, and write the reports ourselves to ensure you get the context a machine can't provide.
                </p>
                <div className="inline-flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center font-bold text-xl">JM</div>
                  <div className="text-left">
                    <div className="font-bold text-white">John Mark</div>
                    <div className="text-sm text-primary-400">Founder & Lead Analyst</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
              How We Keep You Protected
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  icon: Zap,
                  title: '24/7 Monitoring',
                  description: 'Our system scans for new threats twice daily, ensuring you never miss a critical alert.'
                },
                {
                  icon: Shield,
                  title: 'Simplified Analysis',
                  description: 'We convert technical jargon into simple, business-friendly language you can actually use.'
                },
                {
                  icon: Target,
                  title: 'Action Steps',
                  description: 'Every alert includes specific steps you can take to protect your business immediately.'
                },
                {
                  icon: Users,
                  title: 'Direct Sources',
                  description: 'We aggregate intelligence from verified open-source security feeds globally.'
                }
              ].map((step, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Stay Protected?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of business owners who trust us to keep them informed about cybersecurity threats.
            </p>
            <Link to="/subscribe" className="bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-block">
              Get Free Daily Alerts
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}