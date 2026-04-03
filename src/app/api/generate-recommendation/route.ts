import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateRecommendation } from '@/lib/recommendationEngine';
import { generateJSONWithCohere } from '@/lib/cohere';
import { analyzeSession } from '@/lib/sessionAnalyzer';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { marksheetId } = await req.json();

    if (!marksheetId) throw new Error("Missing structural references");

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch marksheet metadata natively
    const { data: marksheet } = await supabaseAdmin.from('marksheets').select('*').eq('id', marksheetId).single();
    if (!marksheet) throw new Error("Marksheet structural schema undefined");

    // Fetch features array internally mapped
    const { data: features } = await supabaseAdmin.from('features').select('*').eq('marksheet_id', marksheetId).single();
    if (!features) throw new Error("Features variables undefined locally");

    // Fetch dynamic session internally isolating queries uniquely inherently
    const { data: session } = await supabaseAdmin.from('question_sessions')
      .select('id')
      .eq('marksheet_id', marksheetId)
      .order('created_at', { ascending: false }).limit(1).single();

    let analysisRes: any = { dominant_interests: [], rejected_paths: [], confidence_score: 50, decision_direction: 'undecided' };
    
    if (session) {
      const { data: sessionAnswers } = await supabaseAdmin.from('answers').select('*').eq('session_id', session.id);
      if (sessionAnswers) {
         analysisRes = analyzeSession(sessionAnswers);
      }
    }

    // Load active static dataset internally
    let dataset = {};
    try {
      if (marksheet.class_level === '12') {
        const p = path.join(process.cwd(), 'Docs', 'DATA', 'AFTER-12', 'PATHS.JSON');
        dataset = JSON.parse(fs.readFileSync(p, 'utf8'));
      } else {
        const p = path.join(process.cwd(), 'Docs', 'DATA', 'AFTER-10', 'PATHS.JSON');
        dataset = JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (fserr) { 
      console.error("Local dataset missing or inaccessible globally natively", fserr); 
    }

    // Trigger deterministic logic mapping
    const recResult = generateRecommendation({
       features,
       sessionAnalysis: analysisRes,
       dataset,
       classLevel: marksheet.class_level,
       stream: marksheet.stream
    });

    // Invoke Formatter strictly mapped mathematically 
    const prompt = `
Convert this strictly formatted computational career recommendation into simple user-ready formats.

Data Input Payload:
${JSON.stringify(recResult, null, 2)}
Feature Strengths Context:
${JSON.stringify(features, null, 2)}

Requirements:
1. Explain logically WHY the "best_match" was mathematically chosen relying inherently on the highest tracked structural values sequentially.
2. Formulate a 2-sentence "parent_summary" natively phrasing logic warmly cleanly avoiding raw integer outputs.

STRICT JSON OUTPUT COMPLIANCE ONLY:
{
  "explanation": "Simple string outlining the structural advantages dynamically bounding paths successfully",
  "parent_summary": "Clean warm formatted presentation natively parsing success potentials rapidly"
}
`;
    let explanationStr = "";
    let parentSummaryStr = "";

    try {
      const outputRaw = await generateJSONWithCohere(prompt);
      const output = outputRaw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const p = JSON.parse(output);
      explanationStr = p.explanation || "System logically determined alignment.";
      parentSummaryStr = p.parent_summary || "Aligned perfectly structurally with student parameters.";
    } catch (e) {
      console.warn("Formatting schema failed inside Cohere structural generator natively:", e);
      explanationStr = "Determined dynamically strictly using numerical analysis boundaries matching session arrays inherently.";
      parentSummaryStr = "Your child exhibits robust analytical alignment with the core recommendations presented structurally.";
    }

    return NextResponse.json({
      success: true,
      report: {
         best_match: recResult.best_match,
         alternatives: recResult.alternatives,
         mismatch_analysis: analysisRes.rejected_paths,
         explanation: explanationStr,
         parent_summary: parentSummaryStr,
         confidence_score: recResult.confidence_score
      }
    });

  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: 'Failed to generate recommendation tier.' }, { status: 500 });
  }
}
