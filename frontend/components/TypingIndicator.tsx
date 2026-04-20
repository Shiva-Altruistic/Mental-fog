import React from 'react';
import { Sparkles } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
    return (
        <div className="flex w-full justify-start mb-6">
            <div className="flex max-w-[85%] flex-row items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 bg-white shadow-sm border border-sage-100 text-sage-400">
                    <Sparkles size={16} />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white border border-sage-100 rounded-tl-sm shadow-sm flex items-center gap-1.5 h-[56px]">
                    <div className="w-2 h-2 bg-sage-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-sage-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-sage-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
};
