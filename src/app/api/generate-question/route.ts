import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { createClient } from '@supabase/supabase-js';

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

    if (!session) {
      const { data: marksheet } = await supabaseAdmin
        .from('marksheets')
        .select('*')
        .eq('id', marksheetId)
        .single();

      if (!marksheet) {
        return NextResponse.json({ error: 'Marksheet not found' }, { status: 404 });
      }

      const datasetType = getDatasetType(marksheet.class_level, marksheet.stream);

      const { data: newSession, error: sessionError } = await supabaseAdmin
        .from('question_sessions')
        .insert([
          {
            user_id: marksheet.user_id,
            marksheet_id: marksheetId,
            dataset_type: datasetType
          }
        ])
        .select()
        .single();
        
      if (sessionError || !newSession) {
        return NextResponse.json({ error: 'Failed to create question session' }, { status: 500 });
      }

      session = newSession.id;
    }

    const { data: qastate } = await supabaseAdmin
      .from('questions')
      .select('question_text, answers(selected_option)')
      .eq('session_id', session)
      .order('order_index', { ascending: true });

    let previousAnswers: { question: string; answer: string }[] = [];
    if (qastate) {
      previousAnswers = qastate.map(q => ({
        question: q.question_text,
        answer: (q.answers && q.answers.length > 0) ? q.answers[0].selected_option : 'No answer yet'
      })).filter(qa => qa.answer !== 'No answer yet');
    }

    if (previousAnswers.length >= 5) {
      return NextResponse.json({ success: true, isComplete: true });
    }

    const prompt = `
You are a career decision system.

Generate ONE MCQ question based on:

Features:
${JSON.stringify(featureData, null, 2)}

Previous Answers:
${JSON.stringify(previousAnswers, null, 2)}

Rules:
- Only return JSON
- No explanation
- Question must be decision-oriented evaluating career path alignments
- 4 options only in a string array
- Keep language simple
- Avoid academic jargon
- Do NOT repeat questions

Output format EXACTLY:
{
  "question": "question text here",
  "options": ["option 1", "option 2", "option 3", "option 4"]
}
`;
    
    // We already defined `model` in /lib/gemini.ts as 2.5-flash which is perfect.
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      console.error("Gemini invalid text generated:", text);
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 });
    }
    
    if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length === 0) {
      return NextResponse.json({ error: 'Malformed AI response' }, { status: 500 });
    }

    const { data: savedQuestion, error: questionError } = await supabaseAdmin
      .from('questions')
      .insert([
        {
          session_id: session,
          question_text: parsed.question,
          options_json: parsed.options,
          order_index: previousAnswers.length
        }
      ])
      .select()
      .single();

    if (questionError || !savedQuestion) {
      return NextResponse.json({ error: 'Failed to save question' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sessionId: session,
      questionId: savedQuestion.id,
      question: savedQuestion.question_text,
      options: savedQuestion.options_json,
      isComplete: false,
      progress: previousAnswers.length + 1
    });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 });
  }
}
