import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { subscribe } from '../services/api';
import { Bell, CheckCircle2, Mail, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Subscribe() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: subscribe,
    onSuccess: () => {
      setSuccess(true);
      setEmail('');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      mutation.mutate(email);
    }
  };

  return (
    <>
      <Helmet>
        <title>Subscribe to Daily Security Alerts | Marliz Sec News</title>
        <meta name="description" content="Get cybersecurity threats simplified and delivered to your inbox every morning. Free daily alerts for small business owners." />
      </Helmet>

      <div className="bg-gradient-to-br from-primary-600 to-primary-800 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {!success ? (
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-primary-600" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    Never Miss a Critical Threat
                  </h1>
                  <p className="text-lg text-slate-600">
                    Join 2,500+ smart business owners getting daily security alerts in plain English.
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4 mb-8">
                  {[
                    'Daily threat alerts delivered every morning',
                    'Complex threats translated into simple English',
                    'Actionable steps you can take immediately',
                    'No jargon, no spam, 100% free'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle2 className="w-6 h-6 text-success-600 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-700">{benefit}</p>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your business email"
                        className="w-full pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {mutation.isPending ? 'Subscribing...' : 'Start Free Alerts'}
                    </button>
                  </div>
                  {mutation.isError && (
                    <p className="text-red-600 text-sm mt-2">
                      {mutation.error?.response?.data?.detail || 'Failed to subscribe. Please try again.'}
                    </p>
                  )}
                </form>

                <p className="text-sm text-slate-500 text-center">
                  No credit card required. Unsubscribe anytime.
                </p>

                {/* Trust Indicators */}
                <div className="border-t border-slate-200 mt-8 pt-8">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary-600">2.5K+</div>
                      <div className="text-xs text-slate-600">Subscribers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-600">Daily</div>
                      <div className="text-xs text-slate-600">Updates</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-600">100%</div>
                      <div className="text-xs text-slate-600">Free</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
                <div className="bg-success-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-success-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  You're All Set!
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  Check your inbox for a confirmation email. Your first alert arrives tomorrow morning.
                </p>
                <a
                  href="/"
                  className="btn-primary inline-flex items-center"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Browse Latest Threats
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}