import React, { useEffect, useState } from 'react';
import { Shield, ShieldAlert, Cpu, Lock, Globe, Terminal, Activity } from 'lucide-react';
import './SecurityIntelligence.css';

const SecurityIntelligence = () => {
    const [counter, setCounter] = useState(0);
    const [scrambledIp, setScrambledIp] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setCounter(prev => prev + 1);
        }, 100);

        // Generate a scary looking fake IP scramble
        const ipChars = '0123456789.ABCDEF';
        const generateScramble = () => {
            let res = '';
            for (let i = 0; i < 4; i++) {
                res += Math.floor(Math.random() * 256) + (i < 3 ? '.' : '');
            }
            return res;
        };

        const scrambleInterval = setInterval(() => {
            setScrambledIp(generateScramble());
        }, 50);

        return () => {
            clearInterval(interval);
            clearInterval(scrambleInterval);
        };
    }, []);

    return (
        <div className="security-intel-container">
            <div className="scanline"></div>
            <div className="noise"></div>

            <header className="intel-header">
                <div className="logo-section">
                    <ShieldAlert size={48} className="alert-icon pulse" />
                    <h1>SECURITY INTELLIGENCE ALERT</h1>
                </div>
                <div className="status-badge">
                    <span className="live-indicator"></span> THREAT DETECTED & NEUTRALIZED
                </div>
            </header>

            <main className="intel-content">
                <div className="warning-box">
                    <div className="warning-header">
                        <Lock className="header-icon" />
                        <h2>SYSTEM ACCESS DENIED</h2>
                    </div>
                    <p className="warning-text">
                        Your IP address has been flagged for a high-severity security violation.
                        The automated bot probes and path traversal attempts you are executing have been blocked by the
                        <strong> Marliz Security Intelligence Engine</strong>.
                    </p>
                </div>

                <div className="intelligence-brief">
                    <h3>INTEL BRIEFING: GOV-MIL-DEFENSE-A1</h3>
                    <div className="brief-grid">
                        <div className="brief-card">
                            <Cpu size={32} />
                            <h4>Neural Defense</h4>
                            <p>This intelligence is trained on government-grade military infrastructure protocols.</p>
                        </div>
                        <div className="brief-card">
                            <Globe size={32} />
                            <h4>Global Tracking</h4>
                            <p>Global threat actor database synchronized. Identity mapping in progress.</p>
                        </div>
                        <div className="brief-card">
                            <Shield size={32} />
                            <h4>Hardened Core</h4>
                            <p>Zero-trust architecture prevents even legitimate administrators from accessing non-public assets without auth.</p>
                        </div>
                    </div>
                </div>

                <div className="user-message-box">
                    <p className="terminal-text">
                        <span className="prompt">$</span> analyze --threat-level critical <br />
                        <span className="prompt">$</span> get --origin-type bot_scanner <br />
                        <span className="prompt">$</span> alert --message "Teaching the silly minds: Attempting to bypass this security is like attacking government military systems."
                    </p>
                </div>

                <div className="data-grid">
                    <div className="data-item">
                        <span className="label">TARGET_IP:</span>
                        <span className="value text-red">{scrambledIp}</span>
                    </div>
                    <div className="data-item">
                        <span className="label">DEFENSE_LVL:</span>
                        <span className="value">MIL-SPEC-A9</span>
                    </div>
                    <div className="data-item">
                        <span className="label">LOG_ID:</span>
                        <span className="value">INTEL-{counter.toString(16).toUpperCase()}</span>
                    </div>
                </div>
            </main>

            <footer className="intel-footer">
                <div className="footer-links">
                    <Activity size={20} />
                    <span>REAL-TIME MONITORING ACTIVE</span>
                </div>
                <button
                    className="go-home-btn"
                    onClick={() => window.location.href = '/'}
                >
                    RETURN TO PUBLIC INTERFACE
                </button>
            </footer>
        </div>
    );
};

export default SecurityIntelligence;
