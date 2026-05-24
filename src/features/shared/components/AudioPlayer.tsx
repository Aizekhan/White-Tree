import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Volume2, Loader2, Music, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../../../translations';
import { API_BASE_URL, getAuthToken } from "../../../config/apiConfig";

interface AudioPlayerProps {
    text: string;
    language: 'UA' | 'ENG';
    tier?: string;
}

const VOICES = {
    UA: [
        { id: 'uk-UA-Wavenet-A', name: 'Premium (Female)', gender: 'FEMALE' },
        { id: 'uk-UA-Neural2-A', name: 'Neural (Female)', gender: 'FEMALE' },
    ],
    ENG: [
        { id: 'en-US-Journey-F', name: 'Premium (Female)', gender: 'FEMALE' },
        { id: 'en-US-Journey-O', name: 'Premium (Male)', gender: 'MALE' },
    ]
};

export function AudioPlayer({ text, language, tier }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const safeLanguage = (language === 'UA' || language === 'ENG') ? language : 'UA';
    const [selectedVoice, setSelectedVoice] = useState(VOICES[safeLanguage][0].id);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const t = translations[safeLanguage] || translations['ENG'];

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    // Reset voice when language changes
    useEffect(() => {
        setSelectedVoice(VOICES[language][0].id);
    }, [language]);

    const handlePlay = async () => {
        if (audioUrl && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
            return;
        }

        setIsLoading(true);
        try {
            const token = await getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/tts`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    text: text.slice(0, 5000), // Safety limit
                    voiceId: selectedVoice,
                    languageCode: language === 'UA' ? 'uk-UA' : 'en-US'
                }),
            });

            if (!response.ok) throw new Error('TTS failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            setIsPlaying(true);
        } catch (error) {
            console.error('TTS Error:', error);
            alert('Failed to generate audio. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white border border-ink/5 rounded-3xl shadow-xl shadow-ink/5">
            <div className="flex items-center gap-4">
                <button
                    onClick={handlePlay}
                    disabled={isLoading || !text}
                    className="w-12 h-12 rounded-2xl bg-ink text-paper flex items-center justify-center hover:bg-violet-600 transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    {isLoading ? (
                        <Loader2 size={24} className="animate-spin text-violet-400" />
                    ) : isPlaying ? (
                        <Pause size={24} />
                    ) : (
                        <Play size={24} className="ml-1" />
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-ink/40 flex items-center gap-1.5">
                            <Music size={12} className="text-violet-500" />
                            {t.narratorAudio || "Narrator Voice"}
                        </span>
                        <select
                            value={selectedVoice}
                            onChange={(e) => {
                                setSelectedVoice(e.target.value);
                                if (audioUrl) {
                                    setAudioUrl(null);
                                    setIsPlaying(false);
                                }
                            }}
                            className="text-[10px] font-bold bg-transparent border-none outline-none text-violet-600 cursor-pointer hover:text-violet-800 transition-colors"
                        >
                            {VOICES[language].map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-2 bg-ink/5 rounded-full overflow-hidden relative">
                        <motion.div
                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => {
                        setIsPlaying(false);
                        setProgress(0);
                    }}
                    onTimeUpdate={(e) => {
                        const el = e.currentTarget;
                        setProgress((el.currentTime / el.duration) * 100);
                    }}
                    autoPlay
                    className="hidden"
                />
            )}
        </div>
    );
}

export default AudioPlayer;
