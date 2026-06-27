"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, ShieldCheck, MapPin, Search, Star, MessageSquare, Briefcase, Zap, IndianRupee } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-sans relative overflow-x-hidden selection:bg-[var(--color-saffron)] selection:text-white">
      
      {/* STICKY NAV */}
      <nav className="sticky top-0 z-50 bg-[var(--color-paper)] border-b-2 border-[var(--color-charcoal)] px-6 py-4 flex justify-between items-center hard-shadow">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--color-saffron)] border-2 border-[var(--color-charcoal)] flex items-center justify-center font-[var(--font-anton)] text-xl tracking-wider uppercase transform -rotate-6 hard-shadow">
            GL
          </div>
          <span className="font-[var(--font-anton)] text-2xl tracking-wide uppercase">GO LESKA</span>
        </div>
        <div className="hidden md:flex gap-8 font-bold text-sm tracking-wide uppercase">
          <Link href="#how" className="hover:text-[var(--color-saffron)] transition-colors">How it works</Link>
          <Link href="#worker" className="hover:text-[var(--color-saffron)] transition-colors">For Workers</Link>
          <Link href="#employer" className="hover:text-[var(--color-saffron)] transition-colors">For Employers</Link>
          <Link href="#trades" className="hover:text-[var(--color-saffron)] transition-colors">Trades</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative px-6 py-24 md:py-32 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8 z-10 relative">
          <div className="inline-block bg-[var(--color-charcoal)] text-[var(--color-paper)] px-4 py-1 text-sm font-bold uppercase tracking-widest border-2 border-[var(--color-charcoal)] transform -rotate-2">
            The Blue Collar Army
          </div>
          <h1 className="font-[var(--font-anton)] text-7xl md:text-8xl leading-[0.9] uppercase tracking-wide text-[var(--color-charcoal)]">
            Kaam Milega.<br/><span className="text-[var(--color-saffron)]">Turant.</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium max-w-xl leading-relaxed">
            India's blue-collar army deserves better than waiting at the chowk. GO LESKA matches verified workers to real jobs in <span className="bg-yellow-300 px-1 border-2 border-[var(--color-charcoal)] font-bold">60 seconds</span> — powered by AI, built for the factory floor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="bg-[var(--color-saffron)] text-[var(--color-charcoal)] font-bold uppercase tracking-wider px-8 py-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover text-lg flex items-center justify-center gap-2 transition-all">
              I want work <ArrowRight size={20} />
            </button>
            <Link href="/login" className="bg-[var(--color-paper)] text-[var(--color-charcoal)] font-bold uppercase tracking-wider px-8 py-4 border-2 border-[var(--color-charcoal)] hard-shadow-hover text-lg flex items-center justify-center gap-2 transition-all">
              I need workers <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* HERO IMAGE / INTERACTIVE COMPONENT */}
        <div className="flex-1 relative w-full h-[500px] bg-[var(--color-charcoal)] border-4 border-[var(--color-charcoal)] hard-shadow overflow-hidden">
           <img src="/welder.png" alt="Indian Welder" className="absolute inset-0 w-full h-full object-cover grayscale-[30%] contrast-125" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
           
           {/* 60s Match Card Overlay */}
           <div className="absolute bottom-8 right-8 left-8 bg-[var(--color-paper)] border-2 border-[var(--color-charcoal)] p-4 hard-shadow z-20 flex items-center gap-4 animate-bounce">
              <div className="w-12 h-12 rounded-full bg-[var(--color-jungle)] border-2 border-[var(--color-charcoal)] flex items-center justify-center text-white">
                <ShieldCheck />
              </div>
              <div>
                <p className="font-bold text-lg leading-tight uppercase">Suresh Kumar (Welder)</p>
                <p className="text-sm font-medium flex items-center gap-1"><Clock size={14} /> Accepted job in 14s</p>
              </div>
           </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="w-full bg-[var(--color-charcoal)] border-y-4 border-[var(--color-charcoal)] py-4 overflow-hidden relative flex">
        <div className="whitespace-nowrap flex animate-[scroll_20s_linear_infinite] text-[var(--color-saffron)] font-[var(--font-anton)] text-3xl tracking-widest uppercase">
           <span className="mx-8">★ AI DISPATCH</span>
           <span className="mx-8">★ 60 SECOND MATCH</span>
           <span className="mx-8">★ AADHAAR VERIFIED</span>
           <span className="mx-8">★ DAILY PAYOUTS</span>
           <span className="mx-8">★ 12 LANGUAGES</span>
           <span className="mx-8">★ AI DISPATCH</span>
           <span className="mx-8">★ 60 SECOND MATCH</span>
           <span className="mx-8">★ AADHAAR VERIFIED</span>
           <span className="mx-8">★ DAILY PAYOUTS</span>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-[var(--font-anton)] text-6xl uppercase tracking-wide">The 60-second hiring cycle</h2>
          <p className="text-xl font-medium mt-4 max-w-2xl mx-auto">Inspired by Ola/Uber dispatch, rebuilt for India's industrial workforce. From "I need workers" to "workers on the way" — under a minute.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { step: "1", title: "Boss Speaks", desc: "Speak or type in Hindi/English." },
            { step: "2", title: "AI Parses", desc: "LLM extracts roles & salary instantly." },
            { step: "3", title: "Engine Ranks", desc: "Matches top local candidates." },
            { step: "4", title: "Worker Pinged", desc: "Gets 30s to accept the job card." },
            { step: "5", title: "Nav Starts", desc: "GPS routing directly to factory." }
          ].map((s, i) => (
            <div key={i} className="bg-white border-2 border-[var(--color-charcoal)] p-6 hard-shadow flex flex-col items-start relative group hover:-translate-y-2 transition-transform">
              <span className="absolute -top-4 -left-4 bg-[var(--color-saffron)] border-2 border-[var(--color-charcoal)] w-10 h-10 flex items-center justify-center font-[var(--font-anton)] text-2xl hard-shadow">{s.step}</span>
              <h3 className="font-bold text-xl uppercase mt-4">{s.title}</h3>
              <p className="text-sm font-medium mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOR WORKERS */}
      <section id="worker" className="bg-[var(--color-charcoal)] text-[var(--color-paper)] border-y-4 border-[var(--color-charcoal)] relative overflow-hidden">
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'}}></div>
        
        <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 space-y-6">
            <h2 className="font-[var(--font-anton)] text-7xl uppercase text-[var(--color-saffron)] leading-none">Tumhari skill.<br/>Tumhari fauj.</h2>
            <p className="text-xl font-medium">No more middlemen. No more standing at the chowk at 5 AM. Get verified once, get matched forever. Every job adds to your permanent reputation.</p>
            <ul className="space-y-4 font-bold text-lg pt-4">
              <li className="flex items-center gap-3"><span className="text-[var(--color-saffron)]">▸</span> 12 Indian languages — Hindi, Marathi, Tamil...</li>
              <li className="flex items-center gap-3"><span className="text-[var(--color-saffron)]">▸</span> Aadhaar + skill verification = trust badge</li>
              <li className="flex items-center gap-3"><span className="text-[var(--color-saffron)]">▸</span> Daily payout. No salary delay drama.</li>
            </ul>
          </div>
          
          <div className="flex-1 relative flex justify-center">
            {/* Phone Mockup Card */}
            <div className="bg-[var(--color-paper)] text-[var(--color-charcoal)] w-80 border-4 border-black p-4 rounded-xl hard-shadow transform rotate-3">
              <div className="border-b-2 border-black pb-3 mb-3 flex justify-between items-center">
                <span className="font-bold uppercase tracking-widest text-sm">New Job Ping</span>
                <Zap size={16} className="text-[var(--color-ember)] fill-[var(--color-ember)]"/>
              </div>
              <h3 className="font-[var(--font-anton)] text-3xl uppercase leading-tight">Fiber Laser Operator</h3>
              <div className="flex items-center gap-2 mt-2 font-bold bg-yellow-300 px-2 py-1 w-max border-2 border-black">
                <IndianRupee size={16} /> 800 / day
              </div>
              <div className="mt-4 space-y-2 text-sm font-bold">
                <p className="flex items-center gap-2"><MapPin size={16}/> 2.1 km away (Pune Factory)</p>
                <p className="flex items-center gap-2"><Clock size={16}/> Accept within 00:24</p>
              </div>
              <div className="flex gap-2 mt-6">
                <button className="flex-1 bg-[var(--color-jungle)] text-white font-bold py-2 border-2 border-black hard-shadow-hover uppercase">Accept</button>
                <button className="flex-1 bg-red-600 text-white font-bold py-2 border-2 border-black hard-shadow-hover uppercase">Pass</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR EMPLOYERS */}
      <section id="employer" className="px-6 py-24 max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-16">
        <div className="flex-1 space-y-6">
          <h2 className="font-[var(--font-anton)] text-7xl uppercase leading-none">Bolo.<br/>AI samajhega.<br/>Workers aayenge.</h2>
          <p className="text-xl font-medium">Type or speak in any Indian language. Our LLM extracts skills, experience, salary and radius. Pick Autonomous AI dispatch or review candidates manually.</p>
        </div>
        
        <div className="flex-1 w-full">
          {/* AI NLP Prompt Card */}
          <div className="bg-white border-4 border-[var(--color-charcoal)] p-6 hard-shadow relative">
            <div className="absolute -top-5 left-6 bg-[var(--color-charcoal)] text-white font-bold px-4 py-1 uppercase tracking-widest text-sm">LLM Dispatch Engine</div>
            <p className="font-medium text-lg italic mt-4 text-gray-700 bg-gray-100 p-4 border-l-4 border-[var(--color-saffron)]">
              "Mujhe 5 fiber laser operators chahiye, kam se kam 3 saal experience, Hindi-English aata ho, salary ₹800/day, 10km radius mein."
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
               <div className="border-2 border-[var(--color-charcoal)] p-2 bg-[var(--color-paper)]">
                 <span className="text-xs uppercase font-bold text-gray-500 block">Role</span>
                 <span className="font-[var(--font-anton)] text-xl">Laser Operator</span>
               </div>
               <div className="border-2 border-[var(--color-charcoal)] p-2 bg-[var(--color-paper)]">
                 <span className="text-xs uppercase font-bold text-gray-500 block">Headcount</span>
                 <span className="font-[var(--font-anton)] text-xl">5 Workers</span>
               </div>
               <div className="border-2 border-[var(--color-charcoal)] p-2 bg-[var(--color-paper)]">
                 <span className="text-xs uppercase font-bold text-gray-500 block">Salary Cap</span>
                 <span className="font-[var(--font-anton)] text-xl">₹800/day</span>
               </div>
               <div className="border-2 border-[var(--color-charcoal)] p-2 bg-[var(--color-paper)]">
                 <span className="text-xs uppercase font-bold text-gray-500 block">Radius</span>
                 <span className="font-[var(--font-anton)] text-xl">10 km</span>
               </div>
            </div>
            <button className="w-full bg-[var(--color-charcoal)] text-white font-bold uppercase tracking-widest mt-6 py-4 border-2 border-black hard-shadow-hover flex items-center justify-center gap-2">
              <Zap size={20} className="fill-[var(--color-saffron)] text-[var(--color-saffron)]"/> Dispatch Now
            </button>
          </div>
        </div>
      </section>

      {/* TRADES WALL */}
      <section id="trades" className="px-6 py-24 bg-white border-y-4 border-[var(--color-charcoal)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-[var(--font-anton)] text-6xl uppercase text-center mb-12">38 Trades. One Army.</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Welder', 'Fitter', 'CNC Operator', 'Forklift Driver', 'Electrician', 'Plumber', 'Mason', 'Painter', 'Carpenter', 'Machine Operator', 'Packer', 'Loader', 'Security Guard', 'Housekeeping', 'Cook'].map((trade) => (
              <div key={trade} className="bg-[var(--color-paper)] border-2 border-[var(--color-charcoal)] px-6 py-3 font-[var(--font-anton)] text-2xl uppercase hard-shadow hover:bg-[var(--color-saffron)] hover:-translate-y-1 transition-all cursor-default">
                {trade}
              </div>
            ))}
            <div className="bg-[var(--color-charcoal)] text-white border-2 border-[var(--color-charcoal)] px-6 py-3 font-[var(--font-anton)] text-2xl uppercase hard-shadow cursor-default">
              + 23 More
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="px-6 py-32 max-w-4xl mx-auto text-center space-y-8">
        <p className="font-[var(--font-anton)] text-5xl md:text-7xl uppercase leading-[0.9] text-[var(--color-charcoal)]">
          India was not built by spreadsheets.
        </p>
        <p className="text-2xl font-medium leading-relaxed bg-[var(--color-saffron)] inline-block px-4 py-2 border-2 border-black hard-shadow transform rotate-1">
          It was built by hands, by sweat, by people who show up at 5 AM with a tiffin and a tool bag. They deserve technology that respects them.
        </p>
      </section>

      {/* FOOTER CTA */}
      <footer className="bg-[var(--color-charcoal)] text-[var(--color-paper)] pt-24 pb-8 px-6 border-t-8 border-[var(--color-saffron)]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
          <h2 className="font-[var(--font-anton)] text-7xl uppercase">Join the blue collar army.</h2>
          <p className="text-xl font-medium max-w-lg">Drop your number. We'll text you the app link and onboard you in 4 minutes — Aadhaar verification included.</p>
          
          <div className="flex w-full max-w-md mt-8">
            <div className="bg-white border-2 border-[var(--color-paper)] text-black font-bold text-xl px-4 flex items-center justify-center">
              +91
            </div>
            <input type="tel" placeholder="Mobile Number" className="flex-1 bg-transparent border-y-2 border-r-2 border-[var(--color-paper)] px-4 py-4 text-xl font-bold outline-none placeholder:text-gray-500" />
            <button className="bg-[var(--color-saffron)] text-[var(--color-charcoal)] font-[var(--font-anton)] text-xl tracking-wider uppercase px-6 py-4 border-2 border-[var(--color-paper)] hard-shadow-hover hover:bg-[var(--color-ember)] transition-colors">
              Get App
            </button>
          </div>
          
          <div className="w-full border-t-2 border-gray-700 mt-24 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-bold uppercase tracking-widest text-gray-400">
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-[var(--color-saffron)]">Made in Bharat 🇮🇳</p>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
