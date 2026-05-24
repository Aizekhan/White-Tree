import { useState, useEffect, useCallback, useRef } from 'react';
import { auth } from '../firebase';
import { API_BASE_URL, getAuthToken } from "../config/apiConfig";

/**
 * Хук для перетворення тексту в мову за допомогою браузерного Web Speech API.
 * Оптимізований для уникнення використання російських голосів для українського тексту.
 */
export function useAudioReading() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const [currentVoiceName, setCurrentVoiceName] = useState<string>("");
    const [voiceMode, setVoiceMode] = useState<'premium' | 'standard'>('premium');
    const [selectedPremiumVoice, setSelectedPremiumVoice] = useState<string>('uk-UA-Wavenet-A');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const PREMIUM_VOICES = {
        UA: [
            { id: 'uk-UA-Neural2-A', label: 'Neural (Premium A)', gender: 'FEMALE' },
            { id: 'uk-UA-Wavenet-A', label: 'Wavenet (Premium B)', gender: 'FEMALE' },
        ],
        ENG: [
            { id: 'en-US-Neural2-F', label: 'Neural (Premium F)', gender: 'FEMALE' },
            { id: 'en-US-Wavenet-D', label: 'Wavenet (Premium D)', gender: 'MALE' },
        ]
    };

    // Оновлюємо список голосів при зміні (браузер завантажує їх асинхронно)
    useEffect(() => {
        if (!synth) return;

        const updateVoices = () => {
            const allVoices = synth.getVoices();
            setVoices(allVoices);
        };

        updateVoices();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = updateVoices;
        }
    }, [synth]);

    const findBestVoice = useCallback((lang: 'ENG' | 'UA') => {
        const targetPrefix = lang === 'UA' ? 'uk' : 'en';
        const allVoices = synth?.getVoices() || voices;

        const langVoices = allVoices.filter(v =>
            v.lang.toLowerCase().startsWith(targetPrefix) ||
            (lang === 'UA' && (v.name.toLowerCase().includes('ukrainian') || v.name.toLowerCase().includes('ukra')))
        );

        const cleanVoices = langVoices.filter(v =>
            !v.lang.toLowerCase().startsWith('ru') &&
            !v.name.toLowerCase().includes('russian') &&
            !v.name.toLowerCase().includes('russ')
        );

        if (cleanVoices.length === 0) return null;

        return cleanVoices.find(v => v.name.toLowerCase().includes('google')) ||
            cleanVoices.find(v => v.name.toLowerCase().includes('neural')) ||
            cleanVoices.find(v => v.name.toLowerCase().includes('natural')) ||
            cleanVoices[0];
    }, [synth, voices]);

    const stop = useCallback(() => {
        if (synth) synth.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current = null;
        }
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentVoiceName("");
    }, [synth]);

    const speakGoogleCloud = useCallback(async (text: string, lang: 'ENG' | 'UA') => {
        setIsLoading(true);
        try {
            const voiceData = PREMIUM_VOICES[lang].find(v => v.id === selectedPremiumVoice) || PREMIUM_VOICES[lang][0];
            const voiceId = voiceData.id;
            const languageCode = lang === 'UA' ? 'uk-UA' : 'en-US';

            const token = await getAuthToken();

            const response = await fetch(`${API_BASE_URL}/api/tts`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    text,
                    voiceId,
                    languageCode
                })
            });

            if (!response.ok) throw new Error("TTS API request failed");

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.oncanplaythrough = () => {
                setIsLoading(false);
            };

            audio.onplay = () => {
                setIsPlaying(true);
                setIsPaused(false);
                setCurrentVoiceName(`Google Cloud (${voiceData.label})`);
            };

            audio.onended = () => {
                setIsPlaying(false);
                setIsPaused(false);
            };

            audio.onerror = () => {
                setIsPlaying(false);
                setIsLoading(false);
                setCurrentVoiceName("");
            };

            await audio.play();
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    }, [selectedPremiumVoice, PREMIUM_VOICES]);

    const speak = useCallback(async (text: string, lang: 'ENG' | 'UA' = 'UA') => {
        if (!text) return;

        stop();

        // Пробуємо Google Cloud TTS (Premium) якщо режим преміальний
        if (voiceMode === 'premium') {
            try {
                await speakGoogleCloud(text, lang);
                return;
            } catch (error) {
                console.warn("Google Cloud TTS failed, falling back to Web Speech API:", error);
            }
        }

        if (!synth) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = findBestVoice(lang);

        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
            setCurrentVoiceName(voice.name);
        } else {
            utterance.lang = lang === 'UA' ? 'uk-UA' : 'en-US';
            setCurrentVoiceName(lang === 'UA' ? "Стандартна заглушка браузера (низька якість)" : "Browser Default (Low Quality)");
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };

        utteranceRef.current = utterance;
        synth.speak(utterance);
    }, [synth, stop, findBestVoice, speakGoogleCloud]);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPaused(true);
        } else if (synth && isPlaying && !isPaused) {
            synth.pause();
            setIsPaused(true);
        }
    }, [synth, isPlaying, isPaused]);

    const resume = useCallback(() => {
        if (audioRef.current && isPaused) {
            audioRef.current.play();
            setIsPaused(false);
        } else if (synth && isPaused) {
            synth.resume();
            setIsPaused(false);
        }
    }, [synth, isPaused]);


    const toggle = useCallback(() => {
        if (isPaused) resume();
        else if (isPlaying) pause();
    }, [isPaused, isPlaying, resume, pause]);

    // Чистимо при розмонтуванні
    useEffect(() => {
        return () => {
            if (synth) synth.cancel();
        };
    }, [synth]);

    return {
        speak,
        pause,
        resume,
        stop,
        toggle,
        isPlaying,
        isPaused,
        isLoading,
        currentVoiceName,
        voiceMode,
        setVoiceMode,
        selectedPremiumVoice,
        setSelectedPremiumVoice,
        PREMIUM_VOICES,
        supported: !!synth
    };
}
