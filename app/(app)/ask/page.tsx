'use client';

import { useState } from 'react';
import { Sparkles, Send, Bot, User, BookOpen, Quote, CheckCircle2, MessageSquare } from 'lucide-react';

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Ask LOOP
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            Grounded RAG Engine
          </span>
        </h1>
        <p className="text-slate-400 text-sm">
          Ask plain-English questions and get answers cited directly from real customer feedback records
        </p>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((sq) => (
          <button
            key={sq}
            onClick={() => handleAsk(sq)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-medium transition-all"
          >
            "{sq}"
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="glass-panel rounded-2xl border border-slate-800 min-h-[450px] p-6 flex flex-col justify-between space-y-6">
        <div className="space-y-6 overflow-y-auto max-h-[520px] pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-lg shadow-indigo-600/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 space-y-4'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Grounded Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-400" />
                      Cited Source Feedback ({msg.sources.length} items):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((src: any) => (
                        <div
                          key={src.id}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-semibold">{src.channel}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold ${
                                src.sentiment === 'POS' ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {src.sentiment}
                            </span>
                          </div>
                          <p className="line-clamp-2 italic text-slate-300">"{src.content}"</p>
                          <span className="text-[9px] text-slate-500 block">ID: {src.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-xs animate-pulse">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>Retrieving vector embeddings & generating grounded response...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-3 pt-4 border-t border-slate-800"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about customer feedback..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
