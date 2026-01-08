import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, Loader2, Info, Headphones } from 'lucide-react';

const AudioBrief = ({ article }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    // We use a ref for synth to avoid re-renders during checks
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    const utteranceRef = useRef(null);
    const heartbeatInterval = useRef(null);

    // CLEANUP on unmount
    useEffect(() => {
        return () => {
            if (synth) {
                synth.cancel();
                if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
            }
        };
    }, [synth]);

    const cleanText = (text) => {
        if (!text) return '';
        // 1. Remove HTML
        const doc = new DOMParser().parseFromString(text, 'text/html');
        let content = doc.body.textContent || "";

        // 2. Remove Markdown & Code Formatting
        return content
            .replace(/https?:\/\/\S+/g, '') // Remove URLs
            .replace(/#+/g, '')            // Remove hashtags
            .replace(/\*+/g, '')           // Remove asterisks
            .replace(/_+/g, '')            // Remove underscores
            .replace(/`+/g, '')            // Remove backticks
            .replace(/>+/g, '')            // Remove blockquotes
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Keep link text, remove URL
            .replace(/-\s+/g, '')          // Remove list dashes
            .replace(/\|/g, ' ')           // Remove vertical bars (tables)
            .replace(/\{.*\}/g, '')        // Remove anything in curly braces (possible JSON/Code)
            .replace(/\s+/g, ' ')          // Normalize spaces
            .trim();
    };

    const startHeartbeat = () => {
        if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
        // Every 10 seconds, toggle pause/resume to keep the browser from "falling asleep"
        // This is a known fix for long speech synthesis tasks on Chrome/Android
        heartbeatInterval.current = setInterval(() => {
            if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
            }
        }, 10000);
    };

    const stopHeartbeat = () => {
        if (heartbeatInterval.current) {
            clearInterval(heartbeatInterval.current);
            heartbeatInterval.current = null;
        }
    };

    const handlePlay = () => {
        if (!synth) return;

        // 1. RESUME LOGIC (If already paused)
        if (isPaused && !isPlaying) {
            synth.resume();
            setIsPlaying(true);
            setIsPaused(false);
            return;
        }

        // 2. FRESH START LOGIC
        setIsLoading(true);
        synth.cancel(); // Clear any stuck utterances

        try {
            const title = article.title || "Defense Briefing";
            const summary = cleanText(article.simplified?.friendly_summary || "");
            const impact = cleanText(article.simplified?.business_impact || "");
            const actionsArr = article.simplified?.action_steps ? JSON.parse(article.simplified.action_steps) : [];
            const actions = Array.isArray(actionsArr) ? actionsArr.join(". ") : "No specific actions provided.";

            const script = `${title}. Intelligence Summary: ${summary}. Operational Impact: ${impact}. Recommended Actions: ${actions}. End of briefing.`;
            const utterance = new SpeechSynthesisUtterance(script);

            // VOICE SELECTION (Prioritize Premium Natural Voices)
            const voices = synth.getVoices();
            const preferredVoice = voices.find(v =>
                v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Enhanced')
            ) || voices.find(v => v.lang.startsWith('en'));

            if (preferredVoice) utterance.voice = preferredVoice;
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // EVENT HANDLERS
            utterance.onstart = () => {
                setIsLoading(false);
                setIsPlaying(true);
                setIsPaused(false);
                startHeartbeat();
            };

            utterance.onend = () => {
                setIsPlaying(false);
                setIsPaused(false);
                stopHeartbeat();
            };

            utterance.onerror = (e) => {
                console.error("Speech Error:", e);
                setIsLoading(false);
                setIsPlaying(false);
                stopHeartbeat();
            };

            // MOBILE COMPATIBILITY: Do not use setTimeout here.
            // Speak must be called directly in the execution thread of the click.
            synth.speak(utterance);

            // UI FALLBACK: If browser doesn't trigger onstart within 2 seconds
            // Force the state so the user isn't stuck looking at a spinning loader
            setTimeout(() => {
                if (synth.speaking && isLoading) {
                    setIsLoading(false);
                    setIsPlaying(true);
                }
            }, 2000);

        } catch (err) {
            console.error("Initialization failed:", err);
            setIsLoading(false);
        }
    };

    const handlePause = () => {
        if (synth) {
            synth.pause();
            setIsPlaying(false);
            setIsPaused(true);
        }
    };

    const handleStop = () => {
        if (synth) {
            synth.cancel();
            setIsPlaying(false);
            setIsPaused(false);
            stopHeartbeat();
        }
    };

    if (!synth) return null;

    return (
        <div className="relative group overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-5 transition-all hover:bg-slate-900/60">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                        <Headphones className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm tracking-wide uppercase">AI Audio Intelligence Briefing</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <p className="text-xs text-slate-400 font-medium">Virtual Assistant Ready</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {isLoading ? (
                        <div className="flex items-center gap-3 px-6 py-3 bg-slate-800 rounded-lg border border-slate-700 text-slate-400 w-full justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            <span className="text-sm font-bold uppercase tracking-widest">Processing</span>
                        </div>
                    ) : isPlaying ? (
                        <div className="flex items-center gap-2 w-full">
                            <button
                                onClick={handlePause}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-all active:scale-95 shadow-lg"
                            >
                                <Pause className="w-4 h-4 fill-current" />
                                <span className="text-sm font-bold uppercase tracking-widest">Pause</span>
                            </button>
                            <button
                                onClick={handleStop}
                                className="p-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg border border-red-500/20 transition-all"
                                title="Stop Briefing"
                            >
                                <Square className="w-4 h-4 fill-current" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handlePlay}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-8 rounded-lg flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95 w-full uppercase tracking-widest text-sm"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            {isPaused ? "Resume Briefing" : "Play Briefing"}
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Accent */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent w-full"></div>
        </div>
    );
};

export default AudioBrief;
