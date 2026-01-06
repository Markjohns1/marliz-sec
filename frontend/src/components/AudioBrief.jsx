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

        // Comprehensive script for the Voice Briefing
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
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 shrink-0">
                    <Volume2 className="w-4 h-4" />
                </div>
                <h3 className="text-white font-bold text-sm md:text-base">Listen to Briefing</h3>
            </div>

            <div className="flex items-center gap-2">
                {isLoading ? (
                    <button disabled className="px-4 py-2 bg-slate-800 text-slate-400 rounded-lg flex items-center gap-2 text-xs font-bold">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading...
                    </button>
                ) : !isPlaying && !isPaused ? (
                    <button
                        onClick={handlePlay}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <Play className="w-3 h-3 fill-current" />
                        Play Briefing
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        {isPlaying ? (
                            <button
                                onClick={handlePause}
                                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-all border border-slate-700"
                            >
                                <Pause className="w-4 h-4 fill-current" />
                            </button>
                        ) : (
                            <button
                                onClick={handlePlay}
                                className="w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition-all"
                            >
                                <Play className="w-4 h-4 fill-current" />
                            </button>
                        )}
                        <button
                            onClick={handleStop}
                            className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg flex items-center justify-center transition-all border border-slate-700"
                        >
                            <Square className="w-3 h-3 fill-current" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioBrief;
