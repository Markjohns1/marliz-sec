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

    // Simplified AudioBrief: Just a sleek button
    return (
        <div className="mb-8">
            {isLoading ? (
                <button disabled className="w-full md:w-auto bg-slate-800 text-slate-400 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all cursor-wait border border-slate-700">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing Briefing...
                </button>
            ) : isPlaying ? (
                <button
                    onClick={handlePause}
                    className="w-full md:w-auto bg-slate-800 text-white hover:bg-slate-700 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all border border-slate-600 shadow-lg"
                >
                    <Pause className="w-4 h-4 fill-current" />
                    Pause Briefing
                </button>
            ) : (
                <button
                    onClick={handlePlay}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <div className="flex items-center justify-center bg-white/20 rounded-full w-6 h-6 mr-1">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                    Play Audio Briefing
                </button>
            )}
        </div>
    );
};

export default AudioBrief;
