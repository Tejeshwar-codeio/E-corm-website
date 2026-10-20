import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Check } from 'lucide-react';
import useLocationStore from '../store/useLocationStore';
import useLanguageStore from '../store/useLanguageStore';
import useToastStore from '../store/useToastStore';

const LocationModal = () => {
  const { isModalOpen, setModalOpen, location, setLocation } = useLocationStore();
  const { t } = useLanguageStore();
  const { addToast } = useToastStore();

  const [country, setCountry] = useState(location.country);
  const [zipCode, setZipCode] = useState(location.zipCode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!zipCode.trim()) {
      addToast('Please enter a valid zip code', 'error');
      return;
    }
    setLocation(country, zipCode);
    addToast(`Delivery location updated to ${country} (${zipCode})`, 'success');
    setModalOpen(false);
  };

  const countries = [
    'United States',
    'India',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Spain'
  ];

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-2xl z-50 border border-gray-100 dark:border-gray-850 flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-lg text-gray-850 dark:text-white">
                  {t('selectLocation')}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-500 leading-relaxed">
              Select your delivery destination country and postal code to calculate shipping charges and localized delivery dates.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Country/Region</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none dark:text-white cursor-pointer"
                >
                  {countries.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-gray-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Zip / Postal Code</label>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter postal code"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl focus:outline-none focus:border-primary-500 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" /> Apply Location
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LocationModal;
