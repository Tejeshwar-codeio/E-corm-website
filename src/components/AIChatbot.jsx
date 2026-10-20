import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, ArrowRight, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import useLanguageStore from '../store/useLanguageStore';

const AIChatbot = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: t('chatbotIntro'),
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, [t]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Math.random().toString(36).substr(2, 9),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response logic
    setTimeout(async () => {
      let responseText = '';
      
      const query = textToSend.toLowerCase();

      if (query.includes('track') || query.includes('order') || query.includes('pedido') || query.includes('commande')) {
        if (!user) {
          responseText = 'Please sign in first to review your order references and track shipments. You can use the Sign In option in the account menu.';
        } else {
          try {
            const { data: orders } = await api.get('/api/orders/myorders');
            if (orders && orders.length > 0) {
              const latestOrder = orders[0];
              responseText = `I found your latest order reference **#${latestOrder._id}** placed on ${new Date(latestOrder.createdAt).toLocaleDateString()}. Its current status is **${latestOrder.status}**.`;
              if (latestOrder.isPaid) {
                responseText += ` The payment of $${latestOrder.totalPrice.toFixed(2)} was successfully captured.`;
              } else {
                responseText += ' Payment is pending checkout completion.';
              }
            } else {
              responseText = 'I checked our records, but you haven\'t placed any orders yet. Visit our shop catalog to configure your first bag!';
            }
          } catch (err) {
            responseText = 'I encountered a pipeline database error checking your orders. Please try again shortly.';
          }
        }
      } else if (query.includes('recommend') || query.includes('recomiend') || query.includes('produit')) {
        responseText = 'Here are our flagship products this season:\n\n1. **ShopSphere Vision Pro Max** ($899) - Spatial audio headset.\n2. **AeroSwift Pro Run Series** ($155) - Engineered Nike-style running footwear.\n3. **ChronoTech Premium Watch** ($349) - Always-on OLED smartwatch loops.\n\nYou can find all of these on our shop page!';
      } else if (query.includes('return') || query.includes('devolv') || query.includes('retour')) {
        responseText = 'We offer a premium **30-day return policy**. Simply pack the item in its original brand packaging, head to your Dashboard under the "Returns" tab, and select request return label. We process refunds within 2-3 business days.';
      } else {
        responseText = 'Thanks for writing. ShopSphere combines the clean typography of Apple, premium sportswear engineering of Nike, and consolidated shipping logistics of Amazon. How else can I guide you today?';
      }

      const botMsg = {
        id: Math.random().toString(36).substr(2, 9),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handlePromptClick = (promptKey, text) => {
    handleSendMessage(text);
  };

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-2xl flex items-center justify-center cursor-pointer z-50 relative border border-white/10"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, x: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-20 left-0 w-80 sm:w-96 h-[500px] rounded-[32px] glass-panel border border-gray-150 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 shadow-2xl flex flex-col overflow-hidden z-40"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-150 dark:border-gray-850 bg-gradient-to-r from-primary-600 to-secondary-600 text-white flex items-center gap-3">
              <Bot className="w-5 h-5 text-white" />
              <div>
                <h4 className="font-bold text-sm leading-tight">{t('chatbotHeader')}</h4>
                <p className="text-[9px] text-primary-200">Online & responsive</p>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0 text-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-gray-50 dark:bg-gray-850 text-gray-700 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-2.5 mr-auto max-w-[85%] items-center">
                  <div className="w-7 h-7 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-850 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-800 flex items-center gap-1">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    <span className="text-[10px] text-gray-400">Typing reply...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts Panel */}
            {messages.length === 1 && (
              <div className="px-5 pb-3 space-y-2">
                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Suggested Questions</p>
                <div className="flex flex-col gap-1.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                  <button
                    onClick={() => handlePromptClick('recommendations', t('chatbotPromptRec'))}
                    className="w-full text-left p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CornerDownRight className="w-3.5 h-3.5 text-primary-500" />
                    {t('chatbotPromptRec')}
                  </button>
                  <button
                    onClick={() => handlePromptClick('return', t('chatbotPromptReturn'))}
                    className="w-full text-left p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CornerDownRight className="w-3.5 h-3.5 text-primary-500" />
                    {t('chatbotPromptReturn')}
                  </button>
                  <button
                    onClick={() => handlePromptClick('orders', t('chatbotPromptTrack'))}
                    className="w-full text-left p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CornerDownRight className="w-3.5 h-3.5 text-primary-500" />
                    {t('chatbotPromptTrack')}
                  </button>
                </div>
              </div>
            )}

            {/* Text Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-4 border-t border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-950/20 flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask support details..."
                className="flex-1 px-4 py-2.5 text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none dark:text-white"
              />
              <button
                type="submit"
                className="p-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatbot;
