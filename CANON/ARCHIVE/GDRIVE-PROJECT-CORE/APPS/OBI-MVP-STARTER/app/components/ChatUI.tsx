'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'obi';
  content: string;
  correction?: string;
  explanation?: string;
}

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [weakPoints, setWeakPoints] = useState<string[]>([]);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const obiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'obi',
        content: data.correction,
        correction: data.correction,
        explanation: data.explanation,
      };

      setMessages((prev) => [...prev, obiMessage]);
      setStreak(data.streak || 0);
      setWeakPoints(data.weakPoints || []);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'obi',
          content: 'Error connecting to OBI. Try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-950 border-b border-purple-500 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">🤖 OBI</h1>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">Streak</p>
              <p className="text-2xl font-bold text-yellow-400">{streak}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Weak Points</p>
              <p className="text-sm text-red-400">
                {weakPoints.slice(0, 2).join(', ') || 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center pt-12">
              <p className="text-gray-400 text-lg">
                👋 Hi! I'm OBI, your English speaking coach.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Speak or type English, and I'll correct you and explain the fix.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-100'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                {msg.explanation && (
                  <p className="text-xs mt-2 opacity-80 border-t border-current pt-2">
                    💡 {msg.explanation}
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-gray-100 p-3 rounded-lg">
                <p className="text-sm">OBI is thinking...</p>
              </div>
            </div>
          )}

          <div ref={messagesEnd} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-950 border-t border-purple-500 p-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Speak or type English..."
            className="flex-1 bg-slate-800 border border-purple-400 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
