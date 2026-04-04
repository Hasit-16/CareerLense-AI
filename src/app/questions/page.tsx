'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { Loader2, Target, AlertCircle } from 'lucide-react';

export default function QuestionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const [marksheetId, setMarksheetId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [progress, setProgress] = useState(1);
  const totalQuestions = 5; // Expected minimum limit dynamically tracking loops
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const questionBlockRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  // Initial Auth & Marksheet check
  useEffect(() => {
    async function loadMarksheet() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      const { data } = await supabase
        .from('marksheets')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (data?.id) {
        setMarksheetId(data.id);
      } else {
        router.replace('/upload');
      }
    }
    loadMarksheet();

    // Background Animation
    const ctx = gsap.context(() => {
      gsap.to(blob1Ref.current, { y: -20, x: 15, scale: 1.05, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(blob2Ref.current, { y: 20, x: -15, scale: 1.05, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });
    }, containerRef);

    return () => ctx.revert();
  }, [router]);

  // Fetch initial question
  useEffect(() => {
    if (marksheetId && !currentQuestion && !sessionId) {
      fetchNextQuestion(marksheetId, null);
    }
  }, [marksheetId]);

  const fetchNextQuestion = async (mId: string, sId: string | null) => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const payload = { marksheetId: mId, sessionId: sId };
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.error) {
        setErrorStatus("Generation Error: " + data.error);
        setLoading(false);
        return;
      }

      if (data.isComplete) {
        animateOutAndNavigate();
        return;
      }

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
      
      setProgress(data.progress || 1);
      
      // Animate transition between questions neatly
      if (currentQuestion) {
        gsap.to([questionBlockRef.current, optionsRef.current], { 
          opacity: 0, 
          y: -20, 
          duration: 0.4, 
          ease: "power2.inOut",
          onComplete: () => updateQuestionState(data) 
        });
      } else {
        updateQuestionState(data);
      }

    } catch (e) {
      setErrorStatus("We couldn’t load the next question. Please try again.");
      setLoading(false);
    }
  };

  const updateQuestionState = (data: any) => {
    setCurrentQuestion({
      id: data.questionId,
      text: data.question,
      options: data.options
    });
    setSelectedOption(null);
    setLoading(false);

    // Entrance Animation natively
    gsap.fromTo(questionBlockRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
    gsap.fromTo(".option-card",
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );
  };

  const animateOutAndNavigate = () => {
    gsap.to(containerRef.current, { 
      opacity: 0, 
      duration: 0.6, 
      ease: "power2.inOut", 
      onComplete: () => router.push('/report') 
    });
  };

  const handleOptionClick = async (option: string) => {
    if (!currentQuestion || selectedOption) return;
    
    setSelectedOption(option);
    
    // Quick micro-reaction natively tracking bounds
    gsap.to(`.option-card`, { opacity: 0.4, duration: 0.3, ease: "power2.out" });
    gsap.to(`[data-id="${option}"]`, { opacity: 1, scale: 0.98, duration: 0.3, ease: "power2.out" });

    await new Promise(r => setTimeout(r, 600)); // Let the user visually digest selection safely
    
    gsap.to([questionBlockRef.current, optionsRef.current], { 
      opacity: 0, 
      y: -20, 
      duration: 0.4, 
      ease: "power2.inOut",
      onComplete: () => {
        setLoading(true);
        const submitAndFetch = async () => {
          try {
            const res = await fetch('/api/submit-answer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ questionId: currentQuestion.id, selectedOption: option, sessionId: sessionId })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            await fetchNextQuestion(marksheetId!, sessionId);
          } catch (e: any) {
            setErrorStatus("Failed to submit. " + e.message);
            setLoading(false);
            gsap.to([questionBlockRef.current, optionsRef.current], { opacity: 1, y: 0, duration: 0.4 });
          }
        };
        submitAndFetch();
      }
    });
  };

  const progressPercentage = Math.min((progress / totalQuestions) * 100, 100);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans">
      
      {/* Background Softness */}
      <div 
        ref={blob1Ref} 
        className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary opacity-20 blur-3xl -z-10 pointer-events-none"
      />
      <div 
        ref={blob2Ref} 
        className="fixed bottom-[0%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent opacity-15 blur-3xl -z-10 pointer-events-none"
      />

      {/* Top Header & Progress */}
      <header className="w-full flex flex-col items-center p-6 max-w-4xl mx-auto z-50">
        <div className="text-xl font-bold tracking-tight text-foreground/80 flex gap-2 items-center mb-6">
          <Target className="w-5 h-5 text-accent" />
          CareerLens AI
        </div>
        <div className="w-full flex items-center justify-between text-xs font-bold tracking-widest uppercase text-foreground/50 mb-2">
          <span>Question {progress}</span>
          <span>Target ~{totalQuestions}</span>
        </div>
        <div className="w-full h-1.5 bg-primary/20 rounded-full overflow-hidden">
           <div 
             className="h-full bg-accent transition-all duration-700 ease-out"
             style={{ width: `${progressPercentage}%` }}
           />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto relative z-10">
        
        {loading && !currentQuestion ? (
          <div ref={loaderRef} className="flex flex-col items-center gap-4 anim-loader">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-lg font-medium text-foreground/70 animate-pulse">
              Understanding your response structurally...
            </p>
          </div>
        ) : errorStatus ? (
          <div className="neu-flat p-8 flex flex-col items-center text-center gap-4 max-w-lg w-full bg-white/40">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <h3 className="text-xl font-bold text-foreground">Connection Hiccup</h3>
            <p className="text-sm text-foreground/70">{errorStatus}</p>
            <button 
              onClick={() => fetchNextQuestion(marksheetId!, sessionId)}
              className="mt-2 text-accent font-bold hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : currentQuestion ? (
          <div className="w-full flex flex-col items-center text-center">
             
             {/* Question Block */}
             <div ref={questionBlockRef} className="mb-12 w-full">
               <h2 className="text-3xl md:text-5xl font-extrabold text-foreground leading-[1.2] text-balance tracking-tight">
                 {currentQuestion.text}
               </h2>
             </div>

             {/* Options Grid */}
             <div ref={optionsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
               {currentQuestion.options.map((opt: string, i: number) => {
                 const isSelected = selectedOption === opt;
                 return (
                   <button
                     key={i}
                     data-id={opt}
                     disabled={selectedOption !== null}
                     onClick={() => handleOptionClick(opt)}
                     className={`option-card w-full p-6 text-lg font-bold rounded-2xl transition-all duration-300 ease-out flex items-center justify-center text-center text-balance
                       ${isSelected 
                         ? 'neu-pressed bg-background text-accent border border-accent/20' 
                         : 'neu-btn bg-background text-foreground hover:text-accent border border-transparent'
                       }
                     `}
                   >
                     {opt}
                   </button>
                 );
               })}
             </div>

          </div>
        ) : null}

      </main>

    </div>
  );
}
