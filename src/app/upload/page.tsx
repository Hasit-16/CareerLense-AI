'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { UploadCloud, CheckCircle, XCircle, FileText, Loader2, ShieldCheck, Target } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "valid" | "invalid">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const pageRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login');
    });

    const ctx = gsap.context(() => {
      gsap.to(blob1Ref.current, { y: -20, x: 15, scale: 1.05, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(blob2Ref.current, { y: 20, x: -15, scale: 1.05, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });

      gsap.from(".anim-title", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" });
      gsap.from(".anim-sub", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.2 });
      gsap.from(".upload-card", { y: 50, opacity: 0, duration: 1, ease: "power3.out", delay: 0.4 });
      gsap.from(".anim-trust", { y: 10, opacity: 0, duration: 0.8, ease: "power2.out", delay: 0.6 });
    }, pageRef);

    return () => ctx.revert();
  }, [router]);

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setErrorMessage('Session expired. Please log in.');
        setStatus('invalid');
        return;
      }

      const res = await fetch('/api/upload-marksheet', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData,
      });

      const uploadData = await res.json();

      if (uploadData.error) {
        setErrorMessage(uploadData.error);
        setStatus("invalid");
        return;
      }

      const ocrRes = await fetch('/api/extract-marksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: uploadData.filePath })
      });

      const ocrData = await ocrRes.json();

      if (ocrData.error || !ocrData.isValid) {
        setErrorMessage(ocrData.error || 'Invalid document. Please upload a valid 10th or 12th marksheet.');
        setStatus("invalid");
        return;
      }

      setStatus("valid");
      setTimeout(() => {
        router.push('/questions');
      }, 1500);

    } catch (e) {
      setErrorMessage("An unexpected error occurred.");
      setStatus("invalid");
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setStatus("idle");
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans">
      {/* Soft Background Blobs */}
      <div 
        ref={blob1Ref} 
        className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary opacity-20 blur-3xl -z-10 pointer-events-none"
      />
      <div 
        ref={blob2Ref} 
        className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent opacity-15 blur-3xl -z-10 pointer-events-none"
      />

      {/* Navbar overlay */}
      <nav className="w-full flex items-center justify-between p-6 max-w-7xl mx-auto z-50">
        <div className="text-xl font-bold tracking-tight text-foreground flex gap-2 items-center cursor-pointer" onClick={() => router.push('/')}>
          <Target className="w-6 h-6 text-accent" />
          CareerLens
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto z-10 relative mt-[-2rem]">
        
        {/* Header */}
        <div className="text-center mb-10 w-full">
          <h1 className="anim-title text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Upload Your Marksheet</h1>
          <p className="anim-sub text-lg text-foreground/75 font-medium text-balance">
            We securely analyze your academic baseline natively mapping core strengths definitively guiding your future dynamically.
          </p>
        </div>

        {/* Upload Card */}
        <div className="upload-card neu-flat w-full p-8 md:p-12 flex flex-col items-center gap-8 relative bg-white/30 backdrop-blur-md">
          
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative group
              ${file ? 'border-accent bg-accent/5' : 'border-highlight hover:border-accent hover:bg-white/40'}
            `}
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={(e) => {
                if(e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                  setStatus("idle");
                }
              }}
              accept=".pdf,.png,.jpg,.jpeg"
            />
            
            <div className="w-20 h-20 rounded-full neu-pressed flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
               <UploadCloud className={`w-8 h-8 ${file ? 'text-accent' : 'text-foreground/50 group-hover:text-accent'}`} />
            </div>

            {file ? (
              <div className="flex flex-col items-center gap-2 z-20">
                <div className="px-4 py-2 bg-background border border-highlight rounded-full flex items-center gap-2 shadow-sm">
                  <FileText className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold truncate max-w-[200px]">{file.name}</span>
                </div>
                <p className="text-xs text-foreground/60 mt-2 font-medium">Click or drag to replace file</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">Drag & Drop or Click</h3>
                <p className="text-foreground/60 text-sm font-medium">Strictly isolated internal parsing natively analyzing 10th / 12th documents limits seamlessly.</p>
              </>
            )}
          </div>

          {/* Validation Status Area */}
          <div className="w-full min-h-[3rem] flex items-center justify-center">
             {status === "uploading" && (
                <div className="flex items-center gap-3 text-accent font-semibold animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <p>Analyzing physical marksheet arrays natively mapping scores securely...</p>
                </div>
             )}
             {status === "valid" && (
                <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full border border-green-200">
                  <CheckCircle className="w-5 h-5" />
                  Valid marksheet verified tightly. Initializing session bounds...
                </div>
             )}
             {status === "invalid" && (
                <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-200 text-center text-sm">
                   <XCircle className="w-5 h-5 flex-shrink-0" />
                   <span className="flex-1 text-balance">{errorMessage}</span>
                </div>
             )}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleUpload}
            disabled={!file || status === "uploading" || status === "valid"}
            className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-3 transition-all duration-300
              ${!file || status === 'uploading' || status === 'valid' 
                ? 'neu-pressed opacity-60 cursor-not-allowed text-foreground/50' 
                : 'neu-btn bg-background text-foreground hover:bg-highlight translate-y-0 hover:-translate-y-1 hover:shadow-lg'
              }
            `}
          >
            {status === "uploading" ? "Mapping Data Layer..." : "Start Diagnosis Analysis Bound"}
          </button>
        </div>

        {/* Security Microtext */}
        <div className="anim-trust mt-8 flex items-center justify-center gap-2 text-foreground/60 text-xs font-semibold">
           <ShieldCheck className="w-4 h-4 text-accent" />
           Your marksheet data is analyzed locally and safely bounded preventing arbitrary external hallucination.
        </div>
      </main>
    </div>
  );
}
