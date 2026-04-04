"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, HelpCircle, CheckCircle, Shield, Target, FileText } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const router = useRouter();
  
  const heroRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reverted dynamically securely running effect boundary internally seamlessly
    const ctx = gsap.context(() => {
      // 1. Floating Backgrounds seamlessly bounded 
      gsap.to(blob1Ref.current, { y: -30, x: 20, scale: 1.05, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(blob2Ref.current, { y: 30, x: -20, scale: 1.05, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });

      // Elements natively fading internally tight sequentially
      gsap.from(".hero-title", { y: 40, opacity: 0, duration: 1, ease: "power3.out", delay: 0.1 });
      gsap.from(".hero-sub", { y: 20, opacity: 0, duration: 1, ease: "power3.out", delay: 0.3 });
      gsap.from(".hero-btn", { scale: 0.9, y: 20, opacity: 0, duration: 0.8, ease: "back.out(1.7)", delay: 0.5 });

      // 2. Problem Section Cards Stagger dynamic limits tightly
      gsap.from(".problem-card", {
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: problemRef.current,
          start: "top 80%",
        }
      });

      // 3. How It Works Steps Sequence
      gsap.from(".step-item", {
        opacity: 0,
        scale: 0.9,
        duration: 0.7,
        stagger: 0.25,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: howItWorksRef.current,
          start: "top 75%",
        }
      });

      // 4. Trust Cards Stagger uniquely mapped cleanly
      gsap.from(".trust-card", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: trustRef.current,
          start: "top 85%",
        }
      });

      // 5. Report Mockup Scale Reveal seamlessly tracked natively
      gsap.from(".report-mockup", {
        opacity: 0,
        scale: 0.95,
        y: 50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: reportRef.current,
          start: "top 80%",
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden font-sans text-foreground" ref={heroRef}>
      
      {/* BACKGROUND BLOBS */}
      <div 
        ref={blob1Ref} 
        className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary opacity-20 blur-3xl -z-10 pointer-events-none"
      />
      <div 
        ref={blob2Ref} 
        className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent opacity-15 blur-3xl -z-10 pointer-events-none"
      />

      {/* NAVBAR */}
      <nav className="w-full flex items-center justify-between p-6 max-w-7xl mx-auto absolute top-0 left-0 right-0 z-50">
        <div className="text-xl md:text-2xl font-black tracking-tighter text-foreground flex gap-2 items-center">
          <Target className="w-7 h-7 text-accent" />
          CareerLens
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="neu-btn px-6 py-2 text-sm font-semibold text-foreground flex items-center justify-center">
            Sign In
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto pt-20">
        <h1 className="hero-title text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
          Your Future. <span className="text-accent underline decoration-primary decoration-4 underline-offset-4">Decoded.</span>
        </h1>
        <p className="hero-sub text-lg md:text-xl text-foreground/80 font-medium mb-10 max-w-2xl text-balance">
          Upload your marksheet. Answer smart behavioral questions. Get your real career path. No generic guessing—just pure, structured decision-making.
        </p>
        <button 
          onClick={() => router.push('/upload')}
          className="hero-btn neu-btn px-10 py-5 text-lg font-bold text-foreground flex items-center gap-3 group"
        >
          Start Diagnosis 
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </section>

      {/* PROBLEM SECTION */}
      <section ref={problemRef} className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Students are confused after 10th and 12th</h2>
          <p className="text-foreground/70 max-w-xl mx-auto text-lg">The traditional path is broken. We replace anxiety with algorithmic certainty.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { t: "Too Many Options", d: "Overwhelmed by choices between commerce, arts, or new sciences." },
            { t: "Parental Pressure", d: "Torn between traditional prestige paths and personal aptitude." },
            { t: "Guesswork", d: "Making lifelong decisions based on internet quizzes or random trends." }
          ].map((prob, i) => (
            <div key={i} className="problem-card neu-flat p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full neu-pressed flex items-center justify-center text-accent font-bold text-lg">
                0{i + 1}
              </div>
              <h3 className="text-xl font-bold text-foreground">{prob.t}</h3>
              <p className="text-foreground/70">{prob.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={howItWorksRef} className="py-24 bg-primary/10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How CareerLens Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[25%] left-[10%] right-[10%] h-[2px] bg-highlight -z-10"></div>
            
            <div className="step-item flex flex-col items-center text-center gap-6 group">
              <div className="w-24 h-24 rounded-full neu-flat flex items-center justify-center group-hover:scale-105 transition-transform">
                <Upload className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold">1. Upload Marksheet</h3>
              <p className="text-foreground/70 px-4">Local OCR parses your exact academic baseline instantly.</p>
            </div>

            <div className="step-item flex flex-col items-center text-center gap-6 group">
              <div className="w-24 h-24 rounded-full neu-flat flex items-center justify-center group-hover:scale-105 transition-transform">
                <HelpCircle className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold">2. Smart Questions</h3>
              <p className="text-foreground/70 px-4">Behavioral logic mapping refines your innate strengths dynamically.</p>
            </div>

            <div className="step-item flex flex-col items-center text-center gap-6 group">
              <div className="w-24 h-24 rounded-full neu-flat flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold">3. Get Career Decision</h3>
              <p className="text-foreground/70 px-4">A strict dataset matrix mathematically chooses your best direction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* REPORT PREVIEW */}
      <section ref={reportRef} className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">Full Explanations. No Magic Boxes.</h2>
        <div className="report-mockup neu-flat p-6 md:p-10 relative overflow-hidden text-left bg-white/40 backdrop-blur-md border border-highlight/50">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full neu-pressed text-accent font-bold text-xs tracking-wider">
                CONFIDENCE SCORE: 94%
              </div>
              <h3 className="text-4xl font-extrabold pb-2 tracking-tight">Computer & IT</h3>
              <p className="text-lg text-foreground/80 leading-relaxed border-l-4 border-accent pl-4 font-medium italic">
                 "Your son exhibits robust analytical alignment with the core recommendations. Algorithmic boundaries correctly mapped specific foundational mathematical strengths."
              </p>
              
              <div className="space-y-3 pt-4">
                <div className="flex justify-between items-center bg-background/50 p-3 rounded-lg border border-highlight/50">
                  <span className="font-semibold text-foreground/80 text-sm">Analytical Skills Evaluated</span>
                  <span className="text-accent font-bold">92/100</span>
                </div>
                <div className="flex justify-between items-center bg-background/50 p-3 rounded-lg border border-highlight/50">
                  <span className="font-semibold text-foreground/80 text-sm">Abstract Logic Evaluated</span>
                  <span className="text-accent font-bold">88/100</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-64 space-y-4">
              <h4 className="font-bold text-foreground/70 uppercase tracking-wider text-[10px]">Mismatched Paths Tracked</h4>
              <div className="neu-pressed p-4 opacity-75">
                <p className="font-bold line-through text-red-500/70 text-sm">Pure Biology</p>
                <p className="text-xs mt-1 text-foreground/60 leading-snug">Rejected during observational boundary test dynamically.</p>
              </div>
              <div className="neu-pressed p-4 opacity-75">
                <p className="font-bold line-through text-red-500/70 text-sm">Commerce/Banking</p>
                <p className="text-xs mt-1 text-foreground/60 leading-snug">Dropped inherently due to explicit dynamic active role selections.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section ref={trustRef} className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { i: Shield, t: "Secure Data", d: "Local marksheet OCR bypasses external providers natively." },
            { i: FileText, t: "Real Evidence", d: "Based directly on academic marks, not just assumptions." },
            { i: HelpCircle, t: "No Guessing", d: "Decisions bounded dynamically by physical dataset arrays." },
            { i: CheckCircle, t: "Parent-Friendly", d: "Produces clean explanatory reports for confident decisions." }
          ].map((val, idx) => (
            <div key={idx} className="trust-card neu-pressed p-6 flex flex-col items-center text-center gap-4">
              <val.i className="w-8 h-8 text-accent" />
              <h4 className="font-bold">{val.t}</h4>
              <p className="text-sm text-foreground/70 leading-relaxed">{val.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-4 text-center bg-foreground text-background relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-primary">Stop guessing. Start knowing.</h2>
        <p className="text-xl max-w-xl mx-auto font-medium text-highlight mb-10 opacity-90 text-balance">
          Give us your marksheet, and we'll dynamically chart a future trajectory natively mapped exclusively to your intrinsic core limits.
        </p>
        <button 
          onClick={() => router.push('/upload')}
          className="px-12 py-5 rounded-xl text-xl font-bold bg-background text-foreground flex items-center justify-center gap-3 mx-auto hover:bg-highlight hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_30px_rgba(214,207,199,0.2)]"
        >
          Start Diagnosis
        </button>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-foreground/95 text-background/50 text-center text-sm relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 flex-col md:flex-row gap-4">
           <span className="font-medium tracking-wide">&copy; {new Date().getFullYear()} CareerLens AI</span>
           <span className="flex items-center gap-2 tracking-wide font-medium">Built strategically natively <Target className="w-4 h-4 text-primary"/></span>
        </div>
      </footer>
    </div>
  );
}
