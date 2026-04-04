import { NextRequest, NextResponse } from 'next/server';
import { generateQuestionWithCohere } from "@/lib/cohere";
import { createClient } from '@supabase/supabase-js';
import { analyzeSession } from '@/lib/sessionAnalyzer';
import { getNextStep } from '@/lib/questionDecisionEngine';

// Cohere is used only for adaptive MCQ generation.
// Career path selection is not done here.

function getDatasetType(classLevel: string, stream?: string | null) {
  const normLevel = classLevel.replace(/\D/g, '');
  if (normLevel === '10') return 'after_10th';
  if (normLevel === '12') {
    const s = (stream || '').toLowerCase();
    if (s.includes('sci')) return 'after_12th_science';
    if (s.includes('com')) return 'after_12th_commerce';
    if (s.includes('art') || s.includes('hum')) return 'after_12th_arts';
  }
  return 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const { marksheetId, sessionId } = await req.json();

    if (!marksheetId) {
      return NextResponse.json({ error: 'Missing marksheetId' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: featureData } = await supabaseAdmin
      .from('features')
      .select('*')
      .eq('marksheet_id', marksheetId)
      .single();

    if (!featureData) {
      return NextResponse.json({ error: 'Features not found for this marksheet' }, { status: 404 });
    }

    let session = sessionId;
    let marksheetObj: any = null;

    if (!session) {
      const { data: marksheet } = await supabaseAdmin
        .from('marksheets')
        .select('*')
        .eq('id', marksheetId)
        .single();

      if (!marksheet) {
        return NextResponse.json({ error: 'Marksheet not found' }, { status: 404 });
      }
      
      marksheetObj = marksheet;
      const datasetType = getDatasetType(marksheet.class_level, marksheet.stream);

      const { data: newSession, error: sessionError } = await supabaseAdmin
        .from('question_sessions')
        .insert([{ user_id: marksheet.user_id, marksheet_id: marksheetId, dataset_type: datasetType }])
        .select()
        .single();
        
      if (sessionError || !newSession) {
        return NextResponse.json({ error: 'Failed to create question session' }, { status: 500 });
      }

      session = newSession.id;
    } else {
      const { data: marksheet } = await supabaseAdmin
        .from('marksheets')
        .select('*')
        .eq('id', marksheetId)
        .single();
      marksheetObj = marksheet;
    }

    const { data: qastate } = await supabaseAdmin
      .from('questions')
      .select('question_text, dimension, answers(selected_option)')
      .eq('session_id', session)
      .order('order_index', { ascending: true });

    let previousAnswers: { question: string; selected_option: string; dimension: string }[] = [];
    const askedDimensions: string[] = [];
    
    if (qastate) {
      previousAnswers = qastate.map(q => {
        if (q.dimension) askedDimensions.push(q.dimension);
        return {
          question: q.question_text,
          selected_option: (q.answers && q.answers.length > 0) ? q.answers[0].selected_option : 'No answer yet',
          dimension: q.dimension || 'unknown'
        };
      }).filter(qa => qa.selected_option !== 'No answer yet');
    }

    let sessionAnalysis = null;
    if (previousAnswers.length > 0) {
      sessionAnalysis = analyzeSession(previousAnswers);
    }

    // Dynamic Flow max 8 stopping condition inherently
    if (previousAnswers.length >= 8) {
      return NextResponse.json({ success: true, isComplete: true, progress: previousAnswers.length });
    }
    
    // Stop dynamically when confident bounds reached cleanly tracking natively
    if (previousAnswers.length >= 5 && sessionAnalysis && sessionAnalysis.confidence_score >= 80) {
      return NextResponse.json({ success: true, isComplete: true, progress: previousAnswers.length });
    }

    const { currentPath, dimension, mappedOptions } = getNextStep(
      marksheetObj?.class_level || '10',
      marksheetObj?.stream || null,
      previousAnswers
    );

    console.log("[BEHAVIOR QUESTION]", dimension, mappedOptions);

    const prompt = `
You are NOT allowed to think freely.

You are ONLY allowed to convert structured decision input into an engaging behavioral MCQ.

INPUT:
- Class: ${marksheetObj?.class_level || 'Unknown'}
- Stream: ${marksheetObj?.stream || 'Unknown'}
- Current Path: ${currentPath}
- Dimension: ${dimension}
- Options (fixed meaning): ${JSON.stringify(mappedOptions)}
- Previous Answers: ${JSON.stringify(previousAnswers)}

RULES:

1. Question:
- must feel interesting and human
- must NOT mention subjects or careers
- must reflect behavior, thinking, or preference
- max 12 words
- simple English (Indian students)

2. Options:
- exactly 4
- max 3 words each
- rewrite for attractiveness
- MUST keep original meaning

3. Strict Boundaries:
- DO NOT introduce new topics
- DO NOT mention engineering, BSc, commerce, etc
- DO NOT invent options outside given list
- DO NOT jump outside currentPath

4. Behavior Mapping:
Each option represents a hidden decision signal:
- analytical -> logic-based careers
- practical -> hands-on careers
- observational -> research/analysis
- people-oriented -> management/social

5. Adaptivity:
- Question must feel like continuation of previous answers
- Must refine user personality, not repeat

OUTPUT JSON ONLY:

{
  "question": "",
  "options": ["", "", "", ""],
  "dimension": "${dimension}"
}
`;
    
    // Execute precisely mapped Cohere execution node!
    console.log("[QUESTION] Cohere question generation started");
    const text = await generateQuestionWithCohere(prompt);
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      console.error("Cohere invalid JSON text generated:", text);
      return NextResponse.json({ error: 'Invalid AI response syntax' }, { status: 500 });
    }
    
    console.log("[QUESTION GENERATED]", parsed);

    if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length !== 4) {
      throw new Error("Invalid question format");
    }

    if (parsed.question.length > 120) {
      throw new Error("Question too long");
    }

    parsed.options.forEach((opt: string) => {
      if (opt.length > 40) {
        throw new Error("Option too long");
      }
    });

    const { data: savedQuestion, error: questionError } = await supabaseAdmin
      .from('questions')
      .insert([
        {
          session_id: session,
          question_text: parsed.question,
          options_json: parsed.options,
          dimension: parsed.dimension || 'unknown',
          order_index: previousAnswers.length
        }
      ])
      .select()
      .single();

    if (questionError || !savedQuestion) {
      return NextResponse.json({ error: 'Failed to save question natively' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sessionId: session,
      questionId: savedQuestion.id,
      question: savedQuestion.question_text,
      options: savedQuestion.options_json,
      isComplete: false,
      progress: previousAnswers.length + 1,
      analysis: sessionAnalysis
    });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: err.message || 'Failed to generate question engine tier' }, { status: 500 });
  }
}
