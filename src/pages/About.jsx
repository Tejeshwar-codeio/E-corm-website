import React from 'react';
import { Award, ShieldAlert, Sparkles } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 space-y-24">
      {/* Hero Narrative */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <span className="text-xs uppercase font-bold tracking-widest text-primary-500">Our Manifesto</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.15] font-display">
          Crafting the Future of <br />
          <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
            Digital Retail
          </span>
        </h1>
        <p className="text-base text-gray-500 leading-relaxed">
          At ShopSphere, we design premium products at the intersection of aesthetic utility, raw athletic power, and absolute security. We believe interfaces should be alive, transitions should feel cinematic, and checkout flows should be completely friction-free.
        </p>
      </section>

      {/* Philosophy Splits */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"
          alt="Brand Quality"
          className="rounded-[32px] overflow-hidden border border-gray-150 dark:border-gray-800 shadow-xl object-cover h-[400px] w-full"
        />
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Design Excellence In Every Thread</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Inspired by the clean precision of Apple and the performance engineering of Nike, we select top-tier materials to deliver smart wearables, acoustic headsets, and apparel tailored to champions.
          </p>
          <div className="space-y-4 text-xs font-semibold text-gray-700 dark:text-gray-200">
            <div className="flex gap-3">
              <div className="p-2.5 bg-primary-500/10 rounded-xl text-primary-500 flex-shrink-0"><Award className="w-5 h-5" /></div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Curated Brands Selection</h4>
                <p className="text-gray-400 mt-0.5 font-normal">Every item undergoes double inspection cycles prior to release.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2.5 bg-secondary-500/10 rounded-xl text-secondary-500 flex-shrink-0"><Sparkles className="w-5 h-5" /></div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Fluid Interaction Dynamics</h4>
                <p className="text-gray-400 mt-0.5 font-normal">Micro-interactions and responsive elements keep the site alive.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 space-y-4 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display">Aesthetic Elegance</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Clean gradients, soft drop-shadows, and glassmorphism elements that blend seamlessly to create a striking first impression.
          </p>
        </div>
        <div className="p-8 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 space-y-4 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display">Raw Athletic Utility</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Lightweight, carbon-plated, moisture-wicking materials designed to support peak physical workouts and recovery cycles.
          </p>
        </div>
        <div className="p-8 rounded-[24px] border border-gray-150/80 dark:border-gray-800/80 bg-white dark:bg-gray-900 space-y-4 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display">Absolute Security</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Encrypted cookies, signature validation, and industry-standard gateway checkouts that ensure user transactions are fully secure.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
