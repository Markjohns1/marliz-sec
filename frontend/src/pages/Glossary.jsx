import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Shield, Zap } from 'lucide-react';
import QuickSearch from '../components/QuickSearch';

const terms = [
    { term: "Zero-Day", definition: "A vulnerability in software that is unknown to the vendor and for which no patch exists. It's called 'zero-day' because the developer has had zero days to fix it." },
    { term: "Phishing", definition: "A social engineering attack where hackers send fraudulent messages designed to trick a person into revealing sensitive information." },
    { term: "Ransomware", definition: "Malware that encrypts a victim's files. The attacker then demands a ransom, typically in cryptocurrency, to restore access." },
    { term: "CVE (Common Vulnerabilities and Exposures)", definition: "A list of publicly disclosed computer security flaws. Each flaw is assigned a unique ID (e.g., CVE-2024-1234)." },
    { term: "SOC (Security Operations Center)", definition: "A centralized unit that deals with security issues on an organizational and technical level." },
    { term: "Data Breach", definition: "An incident where information is accessed without authorization. This often involves personal data, passwords, or intellectual property." },
    { term: "Multi-Factor Authentication (MFA)", definition: "A security system that requires more than one method of authentication from independent categories of credentials to verify the user." },
    { term: "DDoS (Distributed Denial of Service)", definition: "An attack that attempts to disrupt normal traffic of a targeted server, service or network by overwhelming the target with a flood of Internet traffic." },
    { term: "Malware", definition: "Short for 'malicious software,' it's any software intentionally designed to cause damage to a computer, server, client, or computer network." },
    { term: "Botnet", definition: "A network of private computers infected with malicious software and controlled as a group without the owners' knowledge." }
];

const Glossary = () => {
    const [filteredTerms, setFilteredTerms] = useState(terms);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-4">
            <Helmet>
                <title>Cybersecurity Glossary | Marliz Intel</title>
                <meta name="description" content="Master the language of cybersecurity. Definitions for the most important threat intelligence terms." />
            </Helmet>

            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <BookOpen className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Intelligence Glossary</h1>
                            <p className="text-slate-400 mt-1">Master the terminology of modern cyber warfare.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Quick Term Lookup</p>
                        <QuickSearch
                            placeholder="Search glossary..."
                            className="w-full md:w-80"
                            onSearch={(val) => {
                                const filtered = terms.filter(t =>
                                    t.term.toLowerCase().includes(val.toLowerCase()) ||
                                    t.definition.toLowerCase().includes(val.toLowerCase())
                                );
                                setFilteredTerms(filtered);
                            }}
                        />
                    </div>
                </div>

                <div className="grid gap-6">
                    {filteredTerms.length > 0 ? filteredTerms.map((item, index) => (
                        <div key={index} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 hover:border-blue-500/30 transition-all group backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-start gap-4">
                                <span className="text-blue-500 font-mono text-sm pt-1 opacity-50 group-hover:opacity-100">{String(index + 1).padStart(2, '0')}</span>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{item.term}</h3>
                                    <p className="text-slate-400 leading-relaxed">{item.definition}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
                            <p className="text-slate-500 font-bold italic">No matching terms found in our database.</p>
                        </div>
                    )}
                </div>

                <div className="mt-16 bg-blue-600/5 border border-blue-500/10 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="p-4 bg-blue-500/10 rounded-full">
                        <Zap className="w-10 h-10 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2 text-center md:text-left">Stay Informed, Stay Secure</h3>
                        <p className="text-slate-400 text-center md:text-left">Our glossary is updated weekly as new threat vectors evolve. Knowledge is the first layer of defense.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Glossary;
