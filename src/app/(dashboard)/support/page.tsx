"use client";

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send, RefreshCw, Sparkles } from 'lucide-react';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  
  const socketRef = useRef<any>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const userInfoString = localStorage.getItem('userInfo');
      const token = userInfoString ? JSON.parse(userInfoString).token : '';
      const res = await fetch('http://localhost:5000/api/enterprise/support/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTickets(data);
      if (data.length > 0) {
        selectTicket(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setMessages(ticket.messages);
    
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_support_room', ticket._id);
    });

    socket.on('chat_message', (payload: any) => {
      setMessages((prev) => [...prev, payload]);
    });
  };

  useEffect(() => {
    fetchTickets();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !selectedTicket) return;

    const userInfoString = localStorage.getItem('userInfo');
    const token = userInfoString ? JSON.parse(userInfoString).token : '';
    try {
      const res = await fetch(`http://localhost:5000/api/enterprise/support/tickets/${selectedTicket._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text: inputMsg,
          sender: 'Admin'
        })
      });

      if (res.ok) {
        setInputMsg('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAISmartSuggest = () => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.sender !== 'Customer') {
      setInputMsg('How can we assist you with your order catalog today?');
      return;
    }
    
    if (lastMsg.text.toLowerCase().includes('tight') || lastMsg.text.toLowerCase().includes('size')) {
      setInputMsg('We apologize for the sizing mismatch. You can request a zero-cost exchange for a different size directly via your Dashboard, or return the item for a full refund.');
    } else {
      setInputMsg('Thank you for contacting Support. I have flagged your order with our dispatch center to check tracking status and resolve this immediately.');
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-400 text-xs font-bold animate-pulse">Loading Support center dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-250/20 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">Support Tickets</h1>
          <p className="text-xs text-gray-400 mt-1">Chat in real-time with clients and trigger automated AI resolution suggestions</p>
        </div>
        <button 
          onClick={fetchTickets}
          className="p-2 rounded-xl border border-gray-250/20 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] overflow-hidden shadow-sm h-[550px] flex flex-col">
          <div className="overflow-y-auto flex-1 p-4 space-y-2.5 text-xs font-semibold">
            {tickets.map((t) => (
              <div 
                key={t._id} 
                onClick={() => selectTicket(t)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedTicket?._id === t._id 
                    ? 'border-amber-500/10 bg-amber-500/5 dark:bg-amber-500/10' 
                    : 'border-gray-100 dark:border-gray-800/80 bg-transparent hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono text-[9px]">#{t._id.substring(16).toUpperCase()}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                    t.priority === 'High' || t.priority === 'Critical' 
                      ? 'bg-rose-500/10 text-rose-500' 
                      : 'bg-primary-500/10 text-primary-500'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mt-1.5 line-clamp-1">{t.subject}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">User: {t.user?.name || 'Customer'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-[24px] overflow-hidden shadow-sm h-[550px] flex flex-col justify-between">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 flex justify-between items-center text-xs font-semibold">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{selectedTicket.subject}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Assigned to queue • Room: {selectedTicket._id}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold uppercase">
                  {selectedTicket.status}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-semibold">
                {messages.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[70%] ${
                      m.sender === 'Admin' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <span className="text-[9px] text-gray-400 mb-0.5">{m.sender}</span>
                    <div className={`p-3.5 rounded-2xl ${
                      m.sender === 'Admin' 
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-none' 
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-800'
                    }`}>
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 space-y-3">
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={handleAISmartSuggest}
                    className="px-3 py-1.5 rounded-lg border border-amber-500/20 hover:bg-amber-500/10 text-amber-500 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer bg-transparent"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> AI Smart Suggest
                  </button>
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Type support reply or suggest solutions..."
                    className="flex-1 px-4 py-3 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-amber-500 dark:text-white"
                  />
                  <button 
                    type="submit"
                    className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl cursor-pointer border-none flex items-center justify-center shadow"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <p className="text-center py-40 text-gray-400 text-xs font-semibold">Select a support ticket from queue to open live room chat.</p>
          )}
        </div>
      </div>
    </div>
  );
}
