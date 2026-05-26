'use client';

import { useState, useRef, useEffect } from 'react';

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787';
const USER_ID = typeof window !== 'undefined' 
  ? localStorage.getItem('obi_user_id') || `user_${Date.now()}`
  : 'user_default';

export default function MagicChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [streak, setStreak] = useState(0);
  const [weakPoints, setWeakPoints] = useState([]);
  const messagesEnd = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize user ID in localStorage
  useEffect(() => {
    localStorage.setItem('obi_user_id', USER_ID);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (event.results[event.results.length - 1].isFinal) {
            setInput(transcript);
          }
        };
      }
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text, id: Date.now() }
    ]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${WORKER_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          message: text
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'obi',
            content: data.correction || data.explanation,
            correction: data.correction,
            explanation: data.explanation,
            drill: data.drill,
            hook: data.hook,
            id: Date.now() + 1
          }
        ]);

        setStreak(data.streak || 0);
        setWeakPoints(data.weakPoints || []);

        // TTS (optional)
        if ('speechSynthesis' in window && data.correction) {
          const utterance = new SpeechSynthesisUtterance(data.correction);
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'obi',
          content: '❌ Connection error. Try again.',
          id: Date.now() + 1
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-950 bg-opacity-80 backdrop-blur-md border-b border-purple-500/50 px-4 py-3">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-purple-400">🤖 OBI</h1>
            <p className="text-xs text-gray-400">English Speaking Coach</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-xs text-gray-400">Streak</p>
              <p className="text-2xl font-bold text-yellow-400 animate-pulse">{streak}🔥</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Focus</p>
              <p className="text-xs text-purple-300 font-semibold">
                {weakPoints[0] || 'Getting started'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center pt-16">
              <div className="text-6xl mb-4">🎙️</div>
              <p className="text-xl text-purple-300 font-semibold">Speak English for 30 seconds</p>
              <p className="text-sm text-gray-400 mt-2">
                I'll correct you and help you improve
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-lg p-4 rounded-xl backdrop-blur-sm ${
                  msg.role === 'user'
                    ? 'bg-purple-600/70 text-white rounded-br-none'
                    : 'bg-slate-700/70 text-gray-100 rounded-bl-none border border-purple-400/30'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>

                {msg.explanation && (
                  <div className="mt-3 pt-3 border-t border-current/30 space-y-2">
                    <p className="text-xs opacity-90">
                      💡 <span className="font-semibold">{msg.explanation}</span>
                    </p>
                    {msg.drill && (
                      <p className="text-xs opacity-90">
                        🎯 <span className="font-semibold">Drill:</span> {msg.drill}
                      </p>
                    )}
                    {msg.hook && (
                      <p className="text-xs opacity-75 italic">{msg.hook}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-700/50 text-gray-300 p-4 rounded-xl animate-pulse">
                OBI is listening...
              </div>
            </div>
          )}

          <div ref={messagesEnd} />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-950 bg-opacity-80 backdrop-blur-md border-t border-purple-500/50 p-4">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type or speak English..."
              className="flex-1 bg-slate-800/50 border border-purple-400/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
              disabled={loading || isListening}
            />

            <button
              onClick={startListening}
              disabled={loading || isListening}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white px-4 py-3 rounded-lg font-medium transition"
            >
              {isListening ? '🎙️ Listening...' : '🎙️ Speak'}
            </button>

            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>

          {isListening && (
            <p className="text-xs text-blue-400 text-center animate-pulse">
              🎙️ Listening...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
