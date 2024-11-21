import React, {useEffect, useMemo, useRef, useState} from "react";
import { useUnit } from "effector-react";
import {$currentChatMessages, fetchOldMessages, sendMessage} from "../../../entity/chat";

const ChatPage: React.FC = () => {
    const messages = useUnit($currentChatMessages);
    const [message, setMessage] = useState("");

    const sortedMessages = useMemo(() => {
        return messages.sort((a, b) => {
            const timestampA = Number(a.timestamp);
            const timestampB = Number(b.timestamp);
            return timestampA - timestampB;
        });
    }, [messages]);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const [inputSectionHeight, setInputSectionHeight] = useState(0);

    useEffect(() => {
        if (inputRef.current) {
            setInputSectionHeight(inputRef.current.offsetHeight);
        }
    }, [inputRef.current]);

    const handleSend = () => {
        if (message.trim()) {
            sendMessage(message);
            setMessage("");
        }
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && message.length > 0) {
                handleSend();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleSend, message]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        const handleScroll = () => {
            if (messagesContainerRef.current) {
                if (messagesContainerRef.current.scrollTop === 0) {
                    console.log('update')
                    fetchOldMessages()
                }
            }
        };

        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4"
                style={{ maxHeight: `calc(100vh - ${inputSectionHeight}px - 1rem)` }}
            >
                {sortedMessages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                        <div
                            className={`p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
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
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white sticky bottom-0" ref={inputRef}>
                <input
                    type="text"
                    placeholder="Type a message"
                    className="w-full p-2 border rounded"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    ref={inputRef}
                />
                <button className="mt-2 w-full bg-blue-500 text-white py-2 rounded" onClick={handleSend}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatPage;