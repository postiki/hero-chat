import { useState, useCallback } from 'react';
import OpenAI from 'openai'; // Ensure this import is set up correctly

interface UseTextToSpeechReturn {
    loadingMessageId: string | null;
    playingMessageId: string | null;
    handleSpeak: (text: string, messageId: string) => Promise<void>;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
    const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

    const handleSpeak = useCallback(async (text: string, messageId: string) => {
        // Prevent starting a new speech if one is already loading or playing
        if (loadingMessageId || playingMessageId) {
            return;
        }

        setLoadingMessageId(messageId);

        try {
            const openai = new OpenAI({
                apiKey: process.env.REACT_APP_OPENAI_KEY,
                dangerouslyAllowBrowser: true
            });

            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: text
            });

            const arrayBuffer = await mp3.arrayBuffer();
            const audioBlob = new Blob([arrayBuffer], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            setCurrentAudio(audio);
            audio.play();
            setPlayingMessageId(messageId);

            audio.onended = () => {
                setPlayingMessageId(null);
                setCurrentAudio(null);
            };
        } catch (error) {
            console.error('Error playing audio:', error);
        } finally {
            setLoadingMessageId(null);
        }
    }, [loadingMessageId, playingMessageId]);

    return { loadingMessageId, playingMessageId, handleSpeak };
};