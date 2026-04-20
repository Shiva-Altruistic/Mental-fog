import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Wind, RefreshCw } from 'lucide-react';
import { Chat } from '@google/genai';
import { createClaritySession } from './services/ai.ts';
import { MessageBubble, Message } from './components/MessageBubble.tsx';
import { TypingIndicator } from './components/TypingIndicator.tsx';

const INITIAL_MESSAGE: Message = {
    id: 'init-1',
    role: 'model',
    text: "Hello. I'm here to help you untangle your thoughts. \n\nTake a deep breath. What's on your mind right now, or what feels overwhelming?"
};

export default function App() {
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const chatSessionRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Initialize chat session on mount
    useEffect(() => {
        try {
            chatSessionRef.current = createClaritySession();
        } catch (err) {
            console.error("Failed to initialize chat:", err);
            setError("Could not connect to the assistant. Please check your connection.");
        }
    }, []);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Focus input on load
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSendMessage = useCallback(async () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading || !chatSessionRef.current) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: trimmedInput
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await chatSessionRef.current.sendMessage({ message: trimmedInput });
            
            const newModelMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: response.text || "I'm having trouble finding the words. Could you try saying that differently?"
            };
            
            setMessages(prev => [...prev, newModelMessage]);
        } catch (err) {
            console.error("Error sending message:", err);
            setError("I lost my train of thought. Could we try that again?");
            // Remove the user message if it failed to send to keep state clean, or just show error.
            // For a calming app, just showing a gentle error is better.
        } finally {
            setIsLoading(false);
            // Re-focus input after response
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [inputValue, isLoading]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleReset = () => {
        if (window.confirm("Would you like to clear our conversation and start fresh?")) {
            chatSessionRef.current = createClaritySession();
            setMessages([INITIAL_MESSAGE]);
            setError(null);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-screen bg-sage-50 overflow-hidden">
            {/* Header */}
            <header className="flex-none bg-white border-b border-sage-100 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-sage-100 p-2 rounded-full text-sage-600">
                        <Wind size={20} />
                    </div>
                    <div>
                        <h1 className="font-medium text-sage-900 text-lg tracking-tight">Clarity</h1>
                        <p className="text-xs text-sage-500">Your mental space, simplified.</p>
                    </div>
                </div>
                <button 
                    onClick={handleReset}
                    className="p-2 text-sage-400 hover:text-sage-600 hover:bg-sage-50 rounded-full transition-colors"
                    title="Start fresh"
                    aria-label="Reset conversation"
                >
                    <RefreshCw size={18} />
                </button>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8 scroll-smooth">
                <div className="max-w-3xl mx-auto">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                    
                    {isLoading && <TypingIndicator />}
                    
                    {error && (
                        <div className="text-center my-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 max-w-md mx-auto">
                            {error}
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </main>

            {/* Input Area */}
            <footer className="flex-none bg-white border-t border-sage-100 p-4 md:p-6 z-10">
                <div className="max-w-3xl mx-auto relative">
                    <div className="relative flex items-end gap-2 bg-sage-50 border border-sage-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-sage-300 focus-within:border-sage-300 transition-all shadow-sm">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="I'm feeling stuck with..."
                            className="w-full max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-2.5 px-3 text-sage-800 placeholder-sage-400 text-[15px] leading-relaxed"
                            rows={1}
                            disabled={isLoading}
                            style={{
                                height: 'auto',
                                // Simple auto-resize logic
                                height: inputValue ? `${Math.min(inputRef.current?.scrollHeight || 44, 128)}px` : '44px'
                            }}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className={`flex-shrink-0 p-3 rounded-xl flex items-center justify-center transition-all
                                ${inputValue.trim() && !isLoading 
                                    ? 'bg-sage-600 text-white hover:bg-sage-700 shadow-sm' 
                                    : 'bg-sage-200 text-sage-400 cursor-not-allowed'}`}
                            aria-label="Send message"
                        >
                            <Send size={18} className={inputValue.trim() && !isLoading ? 'translate-x-0.5' : ''} />
                        </button>
                    </div>
                    <div className="text-center mt-3">
                        <p className="text-[11px] text-sage-400">
                            Take your time. We'll figure it out step by step.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
