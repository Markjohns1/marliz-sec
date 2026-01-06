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
    { term: "Botnet", definition: "A network of private computers infected with malicious software and controlled as a group without the owners' knowledge." },
    { term: "Advanced Persistent Threat (APT)", definition: "A sophisticated, long-term cyberattack where an intruder gains access to a network and remains undetected for an extended period." },
    { term: "Attack Surface", definition: "The total sum of all possible points (entry points) where an unauthorized user can try to enter data to or extract data from an environment." },
    { term: "Brute Force Attack", definition: "A trial-and-error method used to obtain information such as a user password or personal identification number (PIN)." },
    { term: "Cryptojacking", definition: "The unauthorized use of someone else's computer to mine cryptocurrency." },
    { term: "Dark Web", definition: "A part of the World Wide Web that is only accessible by means of special software, allowing users and website operators to remain anonymous or untraceable." },
    { term: "Encryption", definition: "The process of converting information or data into a code, especially to prevent unauthorized access." },
    { term: "Endpoint", definition: "Any device that is physically an end point on a network, such as laptops, desktops, mobile phones, tablets, and servers." },
    { term: "Exploit", definition: "A piece of software, a chunk of data, or a sequence of commands that takes advantage of a bug or vulnerability to cause unintended behavior." },
    { term: "Firewall", definition: "A network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules." },
    { term: "Honeypot", definition: "A security mechanism that creates a virtual trap to lure attackers. An intentionally compromised computer system to study hacker tactics." },
    { term: "Identity and Access Management (IAM)", definition: "A framework of policies and technologies for ensuring that the proper people in an enterprise have the appropriate access to technology resources." },
    { term: "Incident Response", definition: "An organized approach to addressing and managing the aftermath of a security breach or cyberattack." },
    { term: "Intrusion Detection System (IDS)", definition: "A device or software application that monitors a network or systems for malicious activity or policy violations." },
    { term: "Intrusion Prevention System (IPS)", definition: "A network security tool that continuously monitors a network for malicious activity and takes action to prevent it." },
    { term: "Keylogger", definition: "A type of surveillance software that has the capability to record every keystroke you make to a log file, usually encrypted." },
    { term: "Least Privilege", definition: "The principle that a user should be given only those privileges needed for it to complete its task." },
    { term: "Next-Generation Firewall (NGFW)", definition: "A third-generation firewall technology that combines a traditional firewall with other network device filtering functions." },
    { term: "Penetration Testing", definition: "The practice of testing a computer system, network or web application to find security vulnerabilities that an attacker could exploit." },
    { term: "Privilege Escalation", definition: "The act of exploiting a bug, design flaw or configuration oversight in an operating system or software application to gain elevated access." },
    { term: "Proxy Server", definition: "A server that acts as an intermediary for requests from clients seeking resources from other servers." },
    { term: "Rootkit", definition: "A collection of computer software, typically malicious, designed to enable access to a computer or an area of its software that is not otherwise allowed." },
    { term: "Sandboxing", definition: "A cybersecurity practice where you run code or open a file in a safe, isolated environment on a network that mimics end-user operating environments." },
    { term: "Security Information and Event Management (SIEM)", definition: "A solution that provides real-time analysis of security alerts generated by applications and network hardware." },
    { term: "Social Engineering", definition: "The use of deception to manipulate individuals into divulging confidential or personal information." },
    { term: "Spear Phishing", definition: "A targeted phishing attack directed at a specific individual, organization, or business." },
    { term: "SQL Injection (SQLi)", definition: "A web security vulnerability that allows an attacker to interfere with the queries that an application makes to its database." },
    { term: "Threat Hunting", definition: "The process of proactively and iteratively searching through networks to detect and isolate advanced threats that evade existing security solutions." },
    { term: "Threat Intelligence", definition: "Evidence-based knowledge, including context, mechanisms, indicators, and actionable advice, about an existing or emerging menace or hazard." },
    { term: "Two-Factor Authentication (2FA)", definition: "A security process in which the user provides two different authentication factors to verify themselves." },
    { term: "VPN (Virtual Private Network)", definition: "A service that creates a safe, encrypted connection over a less secure network, such as the public internet." },
    { term: "Vulnerability Management", definition: "The cyclical practice of identifying, classifying, prioritizing, remediating, and mitigating software vulnerabilities." },
    { term: "Whaling", definition: "A type of phishing attack that targets high-profile employees, such as CEOs and CFOs, to steal sensitive information." },
    { term: "XSS (Cross-Site Scripting)", definition: "A type of security vulnerability typically found in web applications that enables attackers to inject client-side scripts into web pages viewed by other users." },
    { term: "Adware", definition: "Software that automatically displays or downloads advertising material such as banners or pop-ups when a user is online." },
    { term: "Air Gap", definition: "A security measure that involves isolating a computer or network and preventing it from establishing an external connection." },
    { term: "Backdoor", definition: "A method of bypassing normal authentication in a cryptosystem or algorithm." },
    { term: "Cloud Security", definition: "A broad set of control-based technologies and policies deployed to protect information, data, applications, and infrastructure associated with cloud computing." },
    { term: "Darknet", definition: "An overlay network within the Internet that can only be accessed with specific software, configurations, or authorization." },
    { term: "Digital Signature", definition: "A mathematical scheme for demonstrating the authenticity of digital messages or documents." },
    { term: "Heuristic Analysis", definition: "A method used by antivirus programs to detect previously unknown computer viruses, as well as new variants of viruses already in the wild." },
    { term: "Indicator of Compromise (IoC)", definition: "An artifact observed on a network or in an operating system that with high confidence indicates a computer intrusion." },
    { term: "Man-in-the-Middle (MitM)", definition: "A type of cyberattack where a malicious actor inserts themselves into a conversation between two parties to secretly relay and possibly alter the communication." },
    { term: "Patch Management", definition: "The process of managing a network of computers by deploying software updates to keep systems up to date." },
    { term: "Security Assessment", definition: "A systematic review of security weaknesses in an information system." },
    { term: "Zombie Computer", definition: "A computer connected to the internet that has been compromised by a hacker, computer virus, or trojan horse and can be used to perform malicious tasks." }
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
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <BookOpen className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Intelligence Glossary</h1>
                            <p className="text-slate-400 mt-1">Master the language of modern cyber warfare.</p>
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
