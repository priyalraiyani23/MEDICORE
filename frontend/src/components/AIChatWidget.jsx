import React, { useState, useRef, useEffect, Fragment } from 'react';
import { Bot, X, Send, User, Minimize2, Maximize2, Loader2, Sparkles } from 'lucide-react';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am Seera. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Parses inline markdown: **bold** → highlighted pill, *italic* → italic
  const renderMarkdown = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return (
          <strong key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary-100 text-primary-700 font-bold text-[0.8em] mx-0.5">
            {inner}
          </strong>
        );
      } else if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="text-gray-500 not-italic text-[0.85em]">{part.slice(1, -1)}</em>;
      }
      return <Fragment key={i}>{part}</Fragment>;
    });
  };

  // Renders a full message: splits by newline, applies inline markdown per line
  const renderMessage = (content) => {
    return content.split('\n').map((line, i, arr) => (
      <Fragment key={i}>
        {renderMarkdown(line)}
        {i < arr.length - 1 && <br />}
      </Fragment>
    ));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isMinimized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const endpoint = '/api/ai/symptom-checker';
      const bodyPayload = { symptoms: userMessage };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', content: data.analysis }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I couldn't process that right now. Please try again later." }]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "Network error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-linear-to-r from-primary-500 to-primary-700 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 z-50 group"
      >
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
        <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div className={`fixed right-6 bottom-6 bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col transition-all duration-300 z-50 border border-gray-200 ${isMinimized ? 'w-72 h-14' : 'w-80 sm:w-96 h-125'}`}>
      
      {/* Header */}
      <div className="bg-linear-to-r from-primary-500 to-primary-700 p-3 flex justify-between items-center text-white cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-bold text-sm">Sympton Checker</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1 hover:bg-white/20 rounded">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 hover:bg-red-500/80 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-300 text-primary-800' : 'bg-primary-500 text-white'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                  {msg.role === 'user' ? msg.content : renderMessage(msg.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 max-w-[85%] self-start">
                <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                  <span className="text-xs text-gray-500 font-medium">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-(--bg-surface) border-t border-(--border-color) flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms..." 
              className="flex-1 px-4 py-2 bg-(--bg-page) border border-(--border-color) text-(--text-main) placeholder-(--text-muted) rounded-full focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-primary-700 transition-colors shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </>
      )}

    </div>
  );
};

export default AIChatWidget;
