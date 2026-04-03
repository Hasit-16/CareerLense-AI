'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function QuestionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [marksheetId, setMarksheetId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  // 1. Fetch latest marksheet natively
  useEffect(() => {
    async function loadMarksheet() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('marksheets')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (data && data.id) {
        setMarksheetId(data.id);
      } else {
        alert('No uploaded marksheet found! Redirecting...');
        router.push('/upload');
      }
    }
    loadMarksheet();
  }, [router]);

  // 2. Fetch the first question once marksheetId is ready
  useEffect(() => {
    if (marksheetId && !currentQuestion && !sessionId) {
      fetchNextQuestion(marksheetId, null);
    }
  }, [marksheetId]);

  const fetchNextQuestion = async (mId: string, sId: string | null) => {
    setLoading(true);
    try {
      const payload = { marksheetId: mId, sessionId: sId };
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.error) {
        alert("Generation Error: " + data.error);
        setLoading(false);
        return;
      }

      if (data.isComplete) {
        // Condition met -> Move to Report
        router.push('/report');
        return;
      }

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
      
      setProgress(data.progress);
      setCurrentQuestion({
        id: data.questionId,
        text: data.question,
        options: data.options
      });
    } catch (e) {
      alert("Failed to load question.");
    }
    setLoading(false);
  };

  const handleOptionClick = async (option: string) => {
    if (!currentQuestion) return;
    setLoading(true);

    try {
      const res = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: currentQuestion.id, selectedOption: option, sessionId: sessionId })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Successfully saved answer -> Let's spin up the next question!
      await fetchNextQuestion(marksheetId!, sessionId);
    } catch (e: any) {
      alert("Failed to submit. " + e.message);
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center p-8 min-h-[50vh] max-w-3xl mx-auto text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-xl font-medium animate-pulse">Generating your next adaptive path...</span>
            <span className="text-sm text-gray-500">Analyzing responses against feature weights...</span>
          </div>
        ) : currentQuestion ? (
          <div className="w-full flex w-full flex-col items-center">
            <div className="mb-4 text-sm text-gray-500 font-mono tracking-widest uppercase">
              Question {progress}
            </div>
            <h2 className="text-2xl font-bold mb-8 text-black/90">
              {currentQuestion.text}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {currentQuestion.options.map((opt: string, i: number) => (
                <button
                  key={i}
                  className="p-4 border border-gray-200 rounded shadow-sm hover:border-black hover:bg-black hover:text-white transition-all ease-out transform active:scale-[0.98] focus:ring-2 focus:ring-black focus:outline-none"
                  onClick={() => handleOptionClick(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>Initializing Engine...</div>
        )}
      </div>
    </AppShell>
  );
}
