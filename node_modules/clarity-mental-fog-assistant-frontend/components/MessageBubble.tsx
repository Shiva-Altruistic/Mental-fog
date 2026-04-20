import React from 'react';
import { User, Sparkles } from 'lucide-react';

export interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
}

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';

    // Simple text formatting to handle basic line breaks if the model returns them
    const formattedText = message.text.split('\n').map((line, i) => (
        <React.Fragment key={i}>
            {line}
            {i !== message.text.split('\n').length - 1 && <br />}
        </React.Fragment>
    ));

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
            <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1
                    ${isUser ? 'bg-sage-200 text-sage-700' : 'bg-white shadow-sm border border-sage-100 text-sage-600'}`}>
                    {isUser ? <User size={16} /> : <Sparkles size={16} />}
                </div>

                {/* Bubble */}
                <div className={`px-5 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm
                    ${isUser 
                        ? 'bg-sage-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-sage-100 text-sage-800 rounded-tl-sm'
                    }`}>
                    {formattedText}
                </div>
            </div>
        </div>
    );
};
