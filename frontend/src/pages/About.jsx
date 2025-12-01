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
          <div className="container-custom">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-6">
                Protecting Small Businesses, One Alert at a Time
              </h1>
              <p className="text-xl text-primary-100">
                We believe every business owner deserves to understand cybersecurity threats without needing a computer science degree.
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
                <p className="text-lg text-slate-700 mb-4">
                  <strong className="text-primary-600">46% of cyberattacks</strong> target small businesses, yet most cybersecurity news is written for IT professionals.
                </p>
                <p className="text-lg text-slate-700 mb-4">
                  We use AI to translate complex technical threats into plain English, giving you clear action steps to protect your business.
                </p>
                <p className="text-lg text-slate-700">
                  No jargon. No overwhelm. Just what you need to know and do.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-primary-50 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-primary-600 mb-2">2.5K+</div>
                  <div className="text-slate-600">Businesses Protected</div>
                </div>
                <div className="bg-success-50 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-success-600 mb-2">Daily</div>
                  <div className="text-slate-600">Threat Updates</div>
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

        {/* How It Works */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
              How We Keep You Protected
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'Auto-Fetch',
                  description: 'Our system scans cybersecurity news every 4 hours from trusted sources.'
                },
                {
                  icon: Shield,
                  title: 'AI Translation',
                  description: 'Claude AI converts technical jargon into simple, business-friendly language.'
                },
                {
                  icon: Target,
                  title: 'Action Steps',
                  description: 'Every alert includes specific steps you can take to protect your business.'
                },
                {
                  icon: Users,
                  title: 'Stay Informed',
                  description: 'Get alerts via email, or browse our site anytime for the latest threats.'
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
          <div className="container-custom text-center">
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