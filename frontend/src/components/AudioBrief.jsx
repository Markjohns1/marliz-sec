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
        // 1. Strip HTML tags
        let content = text.replace(/<[^>]*>/g, ' ');
        // 2. Strip Markdown symbols strictly but keep words
        return content
            .replace(/https?:\/\/\S+/g, '') // No URLs
            .replace(/[#*_{}[\]`>|]/g, ' ') // No special formatting chars
            .replace(/\s+/g, ' ')           // No double spaces
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

        if (isPaused && !isPlaying) {
            synth.resume();
            setIsPlaying(true);
            setIsPaused(false);
            return;
        }

        setIsLoading(true);
        synth.cancel();

        try {
            const summary = cleanText(article.simplified?.friendly_summary || "");
            const impact = cleanText(article.simplified?.business_impact || "");
            const actionsArr = article.simplified?.action_steps ? JSON.parse(article.simplified.action_steps) : [];
            const actions = Array.isArray(actionsArr) ? actionsArr.join(". ") : "";

            const script = `${article.title || ""}. ${summary}. Impact: ${impact}. Actions: ${actions}.`;
            const utterance = new SpeechSynthesisUtterance(script);

            const voices = synth.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices.find(v => v.lang.startsWith('en'));
            if (preferredVoice) utterance.voice = preferredVoice;

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

            utterance.onerror = () => {
                setIsLoading(false);
                setIsPlaying(false);
                stopHeartbeat();
            };

            // Mobile activation
            synth.speak(utterance);

            setTimeout(() => {
                if (synth.speaking || isPlaying) setIsLoading(false);
            }, 300);

        } catch (err) {
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
        <div className="flex items-center gap-2 mt-4">
            {isLoading ? (
                <button disabled className="bg-slate-800 text-slate-400 py-3 px-6 rounded-lg flex items-center gap-2 cursor-wait">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Preparing...</span>
                </button>
            ) : isPlaying ? (
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePause}
                        className="bg-slate-800 hover:bg-slate-700 text-white py-3 px-6 rounded-lg flex items-center gap-2 transition-all active:scale-95 border border-slate-700"
                    >
                        <Pause className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-widest">Pause</span>
                    </button>
                    <button
                        onClick={handleStop}
                        className="p-3 bg-red-900/10 hover:bg-red-900/20 text-red-500 rounded-lg border border-red-500/20 transition-all"
                        title="Stop"
                    >
                        <Square className="w-4 h-4 fill-current" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={handlePlay}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-8 rounded-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg uppercase tracking-widest text-xs"
                >
                    <Play className="w-4 h-4 fill-current" />
                    {isPaused ? "Resume Briefing" : "Play Briefing"}
                </button>
            )}
        </div>
    );
};

export default AudioBrief;
