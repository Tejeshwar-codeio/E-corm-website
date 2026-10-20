import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import useToastStore from '../store/useToastStore';

const Contact = () => {
  const { addToast } = useToastStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);
    setTimeout(() => {
      addToast('Thank you! Your message has been logged in our system.', 'success');
      setName('');
      setEmail('');
      setMessage('');
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Left Info Panel */}
      <div className="lg:col-span-5 space-y-8">
        <div className="space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-primary-500">Contact Us</span>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight font-display">
            We'd Love to Hear <br />
            <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              From You
            </span>
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
            Have questions about our launch series, materials quality, or order tracking? Drop us a line.
          </p>
        </div>

        <div className="space-y-6 text-xs font-semibold text-gray-700 dark:text-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-primary-500/10 rounded-2xl text-primary-500"><Mail className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Direct Mail</p>
              <p className="mt-0.5">support@shopsphere.com</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-secondary-500/10 rounded-2xl text-secondary-500"><Phone className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Phone Support</p>
              <p className="mt-0.5">+1 (800) 555-0199</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-accent-500/10 rounded-2xl text-accent-500"><MapPin className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Corporate HQ</p>
              <p className="mt-0.5">1 Infinite Loop, Cupertino, CA 95014</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:col-span-7">
        <form onSubmit={handleSubmit} className="p-8 rounded-[32px] border border-gray-155/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 space-y-6 shadow-xl">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary-500" /> Send Message
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Message</label>
              <textarea
                rows="6"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your feedback, suggestions, or queries..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {loading ? 'Submitting Form...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
