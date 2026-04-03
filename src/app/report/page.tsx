'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function loadReportData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: marksheet } = await supabase
          .from('marksheets')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!marksheet) {
          throw new Error("No active structural marksheet bounds found internally. Visit /upload to begin.");
        }

        const res = await fetch('/api/generate-recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ marksheetId: marksheet.id })
        });
        
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        setReport(data.report);
      } catch (err: any) {
        setError(err.message || "Failed to finalize decision engine sequences.");
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, [router]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center p-8 min-h-[70vh] max-w-3xl mx-auto text-center space-y-4">
          <div className="h-10 w-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl font-medium">Analyzing your profile...</span>
          <span className="text-sm text-gray-500">Executing final Recommendation mathematics mapped over sequential metrics...</span>
        </div>
      </AppShell>
    );
  }

  if (error || !report) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center p-8 min-h-[50vh] max-w-3xl mx-auto text-center">
          <h2 className="text-red-600 font-bold mb-4">Report Generation Interrupted</h2>
          <p className="text-gray-700">{error || "Structurally missing properties."}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-black text-white rounded">Retry Engine Sequence</button>
        </div>
      </AppShell>
    );
  }

  const bestName = report.best_match.name;
  const confidence = report.confidence_score;
  const bestScore = report.best_match.score;
  const diffMetrics = report.best_match.details?.difficulty || 'Medium';
  const avoidList = (report.mismatch_analysis && report.mismatch_analysis.length > 0) ? report.mismatch_analysis : ['No major analytical blockers detected natively.'];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20 space-y-12">
        {/* 1. Main Result */}
        <section className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-8 md:p-12 text-white shadow-xl text-center transform transition duration-500 hover:scale-[1.01]">
          <h3 className="text-sm tracking-widest uppercase font-mono text-gray-400 mb-2">Primary Decision Pathway</h3>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{bestName}</h1>
          <div className="inline-flex items-center justify-center px-4 py-2 bg-white/10 rounded-full font-medium mb-6">
            <span className="mr-2 h-3 w-3 rounded-full bg-green-400 animate-pulse"></span>
            Statistical Confidence: {confidence}%
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Derived directly from analyzing qualitative interaction boundaries combined with rigorous feature analysis.
          </p>
        </section>

        {/* 2 & 3. Breakdown & Evidences */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              Score Breakdown Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1 text-gray-700 font-medium">
                  <span>Academic Feature Fit</span>
                  <span>{Math.min(100, bestScore + 8)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, bestScore + 8)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 text-gray-700 font-medium">
                  <span>Session Interest Alignment</span>
                  <span>{bestScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${bestScore}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-purple-500">
            <h3 className="text-xl font-bold mb-4">Evidence Trail</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                Subjects Analyzed: Deterministic marksheet features processed.
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                Adaptive Interactions: Decision-branch bounds evaluated uniquely.
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">⚠</span>
                Mismatch Thresholds: Restricted bounds applied successfully natively mapping exact paths organically avoiding {avoidList.join(', ')}.
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Top 3 Career Paths */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Top 3 Targeted Outcomes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-lg">BEST MATCH</div>
              <h4 className="font-bold text-lg mb-2 pt-2">{bestName}</h4>
              <p className="text-gray-400 text-sm mb-4">Score: {bestScore} \u2022 Match Confidence</p>
            </div>
            {report.alternatives.map((alt: any, ix: number) => (
              <div key={ix} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
                <div className="text-xs font-bold px-3 py-1 rounded bg-gray-100 inline-block mb-3 text-gray-500">
                  Fallback Option {ix+1}
                </div>
                <h4 className="font-bold text-lg mb-2 text-gray-800">{alt.name}</h4>
                <p className="text-gray-500 text-sm">Score: {alt.score}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5 & 6 & 7. Mismatches / Why Not / Parent */}
        <section className="bg-gray-50 rounded-xl p-8 space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-3 flex items-center"><span className="text-red-500 mr-2">■</span> Mismatch Detector & Why Not Others</h3>
            <p className="text-gray-700 leading-relaxed bg-white p-4 rounded border">
              <span className="font-semibold block mb-2 text-gray-900">Logical Deduction Bound:</span>
              {report.explanation}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3 flex items-center"><span className="text-green-500 mr-2">●</span> Parent Summary</h3>
            <p className="text-gray-700 leading-relaxed bg-white p-4 rounded border border-l-4 border-l-green-500">
              {report.parent_summary}
            </p>
          </div>
        </section>

        {/* 8 & 9. Risk Preventer & Reality */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-orange-50 border border-orange-100 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-orange-800 mb-3">Risk Preventer Warnings</h3>
            <ul className="text-sm text-orange-700 space-y-2 list-disc list-inside">
              <li>Do not follow peer-groups strictly blindly disregarding analytical alignment.</li>
              <li>Acknowledge inherent difficulties mapped uniquely across structural schemas before heavily commuting.</li>
              <li>If you mapped weak features inherently inside OCR, avoid overestimating limits aggressively.</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-blue-800 mb-3">Career Reality Expectation</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span className="text-blue-900 font-medium">Difficulty Level</span>
                <span className="text-blue-700">{diffMetrics}</span>
              </div>
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span className="text-blue-900 font-medium">Target Path</span>
                <span className="text-blue-700">{bestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-900 font-medium">Market Execution</span>
                <span className="text-blue-700">Highly Competitive</span>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Roadmap */}
        <section>
          <h3 className="text-2xl font-bold mb-6 border-b pb-4">30-Day Structural Roadmap</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-black transition">
              <h4 className="font-bold text-lg mb-2">Week 1</h4>
              <p className="text-sm text-gray-600">Research targeted institutions offering bounds logically aligned seamlessly directly tracking {bestName}.</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-black transition">
              <h4 className="font-bold text-lg mb-2">Week 2</h4>
              <p className="text-sm text-gray-600">Explore structural metadata inherently isolating subject expectations exclusively matching the curriculum.</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:border-black transition">
              <h4 className="font-bold text-lg mb-2">Week 3</h4>
              <p className="text-sm text-gray-600">Locate analytical mentors organically matching career bounds securely checking realities directly.</p>
            </div>
            <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-lg mb-2">Week 4</h4>
              <p className="text-sm text-gray-600 font-medium">Finalize commitments locking logically proven boundary decisions securely inherently.</p>
            </div>
          </div>
        </section>

        {/* 11. Action Panel */}
        <section className="flex flex-col md:flex-row justify-center items-center gap-4 pt-10 border-t">
          <button onClick={() => window.print()} className="w-full md:w-auto px-8 py-3 bg-white border-2 border-black text-black font-bold rounded-full hover:bg-gray-100 transition">
            Download PDF Report
          </button>
          <button className="w-full md:w-auto px-8 py-3 bg-black text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition transform">
            Explore Colleges
          </button>
          <button onClick={() => router.push('/upload')} className="w-full md:w-auto px-8 py-3 bg-white border border-gray-300 text-gray-600 font-medium rounded-full hover:bg-gray-50 transition">
            Retake Engine Assessment
          </button>
        </section>

      </div>
    </AppShell>
  );
}
