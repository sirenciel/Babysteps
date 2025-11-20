import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Info } from 'lucide-react';
import { chatWithParentingCoach } from '../services/geminiService';
import { ChatMessage } from '../types';

const SUGGESTIONS = [
  "How much should a 3-month-old sleep?",
  "Signs of teething?",
  "Best first foods for MPASI?",
  "How to handle separation anxiety?"
];

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hi! I'm your BabySteps Coach. I can help with sleep schedules, nutrition, or just reassurance. What's on your mind?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Simple history formatting for context
    const history = messages.map(m => `${m.role}: ${m.text}`);
    const responseText = await chatWithParentingCoach(history, text);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto md:h-[600px] md:mt-8 md:rounded-3xl md:shadow-2xl md:border md:border-gray-200 overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-primary p-4 text-white flex items-center gap-3 shadow-md z-10">
        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
           <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-bold">BabySteps AI Coach</h3>
          <p className="text-xs text-pink-100 flex items-center gap-1"><Info size={10}/> Not medical advice. Consult a doctor.</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#F9F7F7]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-white text-primary border border-primary/20'}`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-dark text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-primary/20 flex items-center justify-center">
               <Bot size={14} className="text-primary" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 flex gap-2 items-center">
               <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-100"></span>
               <span className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
         <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
           {SUGGESTIONS.map(s => (
             <button key={s} onClick={() => handleSend(s)} className="whitespace-nowrap px-3 py-1.5 bg-white border border-primary/30 text-primary text-xs rounded-full hover:bg-primary hover:text-white transition-colors">
               {s}
             </button>
           ))}
         </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about sleep, food, or milestones..."
            disabled={isLoading}
            className="w-full bg-gray-100 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <button 
            onClick={() => handleSend()} 
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;