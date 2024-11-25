import React, {useEffect, useMemo, useRef, useState} from "react";
import {useUnit} from "effector-react";
import {$messagesStore, sendMessage} from "../../../entity/chat";
import {useTextToSpeech} from "../../../hooks/useTextToSpeech";

interface IChatPage {
    chatId: string
}

const ChatPage: React.FC<IChatPage> = ({chatId}) => {
    const allMessages = useUnit($messagesStore);
    const messages = allMessages[chatId] || []
    const [message, setMessage] = useState("");
    const sortedMessages = useMemo(() => {
        return messages.sort((a, b) => {
            const timestampA = Number(a.timestamp);
            const timestampB = Number(b.timestamp);
            return timestampA - timestampB;
        });
    }, [messages]);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inputContainerRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }, [message]);

    const handleSend = () => {
        if (message.trim()) {
            sendMessage(message);
            setMessage("");
            if (inputRef.current) {
                inputRef.current.style.height = 'auto';
            }

            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
                }
            }, 100);
        }
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey && message.length > 0) {
                e.preventDefault();
                handleSend();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [message]);

    useEffect(() => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
            }
        }, 100);
    }, [messages]);

    const [isSafari, setIsSafari] = useState(false);
    useEffect(() => {
        const isMobileSafari = () => {
            const userAgent = window.navigator.userAgent;
            return /iP(ad|hone|od).+Version\/[\d.]+.*Safari/.test(userAgent);
        };
        const isSafari = isMobileSafari();
        if (isSafari) {
            setIsSafari(true);
        }
    }, []);

    useEffect(() => {
        const handleTouchStart = () => {
            messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
        };

        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('touchstart', handleTouchStart);
        }

        return () => {
            if (container) {
                container.removeEventListener('touchstart', handleTouchStart);
            }
        };
    }, []);

    const { loadingMessageId, playingMessageId, handleSpeak } = useTextToSpeech();

    return (
        <div className="flex flex-col h-full">
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4"
                style={{ maxHeight: `calc(100vh - ${inputContainerRef.current?.offsetHeight || 0}px - 1rem - ${isSafari ? 83 : 0}px)` }}
            >
                {sortedMessages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                        <div
                            className={`p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                            style={{ wordWrap: 'break-word', maxWidth: '80%' }}
                        >
                            {message.text}
                        </div>
                        <div className="flex items-end">
                            <span className="text-xs text-gray-500 ml-2">
                                {new Date(Number(message.timestamp)).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                            <button
                                onClick={() => handleSpeak(message.text, message.id)}
                                className={`ml-2 text-xs ${
                                    loadingMessageId === message.id ? 'text-gray-400' :
                                        playingMessageId === message.id ? 'text-green-500' :
                                            'text-blue-500'
                                }`}
                                disabled={loadingMessageId === message.id}
                            >
                                {loadingMessageId === message.id ? 'Loading...' :
                                    playingMessageId === message.id ? 'Playing...' :
                                        'Speak'}
                            </button>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white sticky bottom-0" ref={inputContainerRef}>
                <textarea
                    placeholder="Type a message"
                    className="w-full p-2 border rounded resize-none overflow-hidden"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    ref={inputRef}
                    rows={1}
                />
                <button className="mt-2 w-full bg-blue-500 text-white py-2 rounded" onClick={handleSend}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
