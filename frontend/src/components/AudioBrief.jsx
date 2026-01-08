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

        // Reset if browser dropped the sync
        if (isPaused) {
            try {
                synth.resume();
                setIsPlaying(true);
                setIsPaused(false);
                // Chrome Bug Fix: Sometimes resume() needs a kick
                if (synth.paused) {
                    synth.cancel();
                    // Fallthrough to a fresh start
                } else {
                    return;
                }
            } catch (e) {
                synth.cancel();
            }
        }

        setIsLoading(true);

        try {
            const title = article.title || "Unknown Article";
            const summary = stripHtml(article.simplified?.friendly_summary || "No summary available.");
            const impact = stripHtml(article.simplified?.business_impact || "Business impact details are currently unavailable.");

            let actions = "";
            const rawActions = article.simplified?.action_steps;
            if (rawActions) {
                if (Array.isArray(rawActions)) {
                    actions = "Recommended actions: " + rawActions.join(". ");
                } else if (typeof rawActions === 'object') {
                    actions = "Recommended actions: " + Object.values(rawActions).join(". ");
                } else {
                    try {
                        const parsed = JSON.parse(rawActions);
                        actions = "Recommended actions: " + (Array.isArray(parsed) ? parsed.join(". ") : Object.values(parsed).join(". "));
                    } catch (e) {
                        actions = "Recommended actions: " + stripHtml(rawActions);
                    }
                }
            }

            const script = `Digital Intelligence Briefing. Title: ${title}. Summary: ${summary}. Impact Analysis: ${impact}. ${actions}. This concludes the briefing.`;
            const utterance = new SpeechSynthesisUtterance(script);

            // Select a premium sounding voice
            const voices = synth.getVoices();
            const preferredVoice = voices.find(v =>
                (v.name.includes('Google') && v.lang.includes('en')) ||
                (v.name.includes('Natural') && v.lang.includes('en')) ||
                (v.name.includes('Premium') && v.lang.includes('en')) ||
                (v.name.includes('Female') && v.lang.includes('en'))
            ) || voices.find(v => v.lang.startsWith('en'));

            if (preferredVoice) {
                utterance.voice = preferredVoice;
                utterance.lang = preferredVoice.lang;
            } else {
                utterance.lang = 'en-US';
            }

            utterance.rate = 0.92;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            utteranceRef.current = utterance;

            utterance.onstart = () => {
                setIsLoading(false);
                setIsPlaying(true);
            };

            utterance.onend = () => {
                setIsPlaying(false);
                setIsPaused(false);
                utteranceRef.current = null;
            };

            utterance.onerror = (event) => {
                console.error('Audio Intelligence Error:', event);
                setIsLoading(false);
                setIsPlaying(false);
                setIsPaused(false);
            };

            // Force cancel any stuck processes before starting fresh
            synth.cancel();

            // Short delay to let the cancel settle (fixes some mobile browser issues)
            setTimeout(() => {
                synth.speak(utterance);
            }, 100);

        } catch (err) {
            console.error("Briefing Initialization Failed:", err);
            setIsLoading(false);
        }
    };

    const handlePause = () => {
        if (synth) {
            synth.pause(); // Use pause() instead of cancel() to allow resume()
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
