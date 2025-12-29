import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Loader2 } from 'lucide-react';

const AudioBrief = ({ article }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasVoice, setHasVoice] = useState(false);
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    const utteranceRef = useRef(null);

    useEffect(() => {
        // Check if voices are available
        const checkVoices = () => {
            const voices = synth?.getVoices();
            if (voices && voices.length > 0) {
                setHasVoice(true);
            }
        };

        checkVoices();
        if (synth?.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = checkVoices;
        }

        return () => {
            if (synth) {
                synth.cancel();
            }
        };
    }, [synth]);

    const stripHtml = (html) => {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const handlePlay = () => {
        if (!synth) return;

        if (isPaused) {
            synth.resume();
            setIsPlaying(true);
            setIsPaused(false);
            return;
        }

        setIsLoading(true);

        // Comprehensive script for the AI Voice
        const title = article.title;
        const summary = stripHtml(article.simplified?.friendly_summary);
        const impact = stripHtml(article.simplified?.business_impact);

        let actions = "";
        if (article.simplified?.action_steps) {
            try {
                const steps = JSON.parse(article.simplified.action_steps);
                actions = "Recommended actions are: " + steps.join(". ");
            } catch (e) {
                actions = stripHtml(article.simplified.action_steps);
            }
        }

        const script = `Intelligence briefing on: ${title}. ${summary}. Impact analysis: ${impact}. ${actions}. End of briefing.`;

        const utterance = new SpeechSynthesisUtterance(script);

        // Select a premium sounding voice if available (Google US English, etc)
        const voices = synth.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Google') && v.lang.startsWith('en') ||
            v.name.includes('Premium') ||
            v.name.includes('Female') && v.lang === 'en-US'
        ) || voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 0.95; // Slightly slower for clarity
        utterance.pitch = 1;
        utteranceRef.current = utterance;

        utterance.onstart = () => {
            setIsLoading(false);
            setIsPlaying(true);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };

        utterance.onerror = (event) => {
            console.error('TTS Error:', event);
            setIsLoading(false);
            setIsPlaying(false);
        };

        synth.cancel(); // Stop any current speech
        synth.speak(utterance);
    };

    const handlePause = () => {
        if (synth && isPlaying) {
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
        }
    };

    if (!synth) return null;

    return (
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                    <Volume2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Listen to Briefing</h3>
                    <p className="text-slate-400 text-sm">AI-generated audio intelligence report</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {isLoading ? (
                    <button disabled className="px-6 py-2.5 bg-slate-800 text-slate-400 rounded-xl flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Preparing...
                    </button>
                ) : !isPlaying && !isPaused ? (
                    <button
                        onClick={handlePlay}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Play Briefing
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        {isPlaying ? (
                            <button
                                onClick={handlePause}
                                className="w-12 h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center transition-all border border-slate-700"
                            >
                                <Pause className="w-5 h-5 fill-current" />
                            </button>
                        ) : (
                            <button
                                onClick={handlePlay}
                                className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-blue-500/20"
                            >
                                <Play className="w-5 h-5 fill-current" />
                            </button>
                        )}
                        <button
                            onClick={handleStop}
                            className="w-12 h-12 bg-slate-800 hover:bg-red-900/20 hover:text-red-400 text-slate-400 rounded-full flex items-center justify-center transition-all border border-slate-700 hover:border-red-500/30"
                        >
                            <Square className="w-5 h-5 fill-current" />
                        </button>
                        <div className="hidden md:flex flex-col ml-2">
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none mb-1">Status</span>
                            <span className="text-xs text-white font-medium animate-pulse">
                                {isPlaying ? 'Speaking...' : 'Paused'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioBrief;
