'use client';

import { useState } from 'react';
import { Sparkles, Send, Bot, User, BookOpen, Quote, CheckCircle2, MessageSquare, Terminal, Cpu } from 'lucide-react';

export default function AskLoopPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am Ask LOOP, your grounded AI Feedback Intelligence assistant. Ask me anything about what your customers are saying, and I will summarize answers backed strictly by real feedback in your workspace.',
    },
  ]);

  const suggestedQuestions = [
    'What are users saying about payment?',
    'What is the biggest complaint regarding onboarding?',
    'Are customers requesting SAML or SSO authentication?',
    'How do users rate our new dashboard performance?',
  ];

  const handleAsk = async (qText?: string) => {
    const query = qText || question;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!qText) setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });
      const data = await res.json();

      const assistantMsg = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Ask LOOP error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Apologies, failed to retrieve grounded feedback answer.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div>
        <div className="flex items-center gap-2 mb-1 font-mono">
          <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-950/90 border border-cyan-500/40 px-2.5 py-0.5 rounded-full uppercase shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            RAG GROUNDED TERMINAL
          </span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
          Ask LOOP AI Assistant
        </h1>
        <p className="text-slate-400 text-xs font-mono">
          Query feedback streams in natural language with source-cited grounding guarantees
        </p>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2 font-mono">
        {suggestedQuestions.map((sq) => (
          <button
            key={sq}
            onClick={() => handleAsk(sq)}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-bold transition-all hover:border-cyan-400/50"
          >
            "{sq}"
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="cyber-glass-panel rounded-2xl border border-slate-800 min-h-[480px] p-6 flex flex-col justify-between space-y-6">
        <div className="space-y-6 overflow-y-auto max-h-[540px] pr-2 font-sans">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-lg shadow-cyan-500/20 border border-cyan-300/40">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold shadow-md shadow-cyan-500/20 border border-cyan-300/40 font-mono'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 space-y-4'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {/* Grounded Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2 font-mono">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      Cited Source Feedback ({msg.sources.length} items):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans">
                      {msg.sources.map((src: any) => (
                        <div
                          key={src.id}
                          className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="font-bold">{src.channel}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold ${
                                src.sentiment === 'POS' ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {src.sentiment}
                            </span>
                          </div>
                          <p className="line-clamp-2 italic text-slate-300">"{src.content}"</p>
                          <span className="text-[9px] font-mono text-slate-500 block">ID: {src.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-purple-600/30 border border-purple-400/30">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-cyan-400 text-xs animate-pulse font-mono">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span>Vector index search & RAG synthesis in progress...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-3 pt-4 border-t border-slate-800 font-mono"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about customer feedback streams..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-cyan-500/25 disabled:opacity-50 transition-all border border-cyan-300/40"
          >
            <span>QUERY</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
